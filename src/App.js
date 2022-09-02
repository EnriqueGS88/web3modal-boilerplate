import './App.css';
import { useEffect, useState } from 'react';
import {
  VStack,
  Button,
  Text,
  HStack,
  Select,
  Box,
  Tooltip
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { networkParams } from './networks';
import { toHex, truncateAddress } from './utils';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { providerOptions } from './providerOptions';

const web3Modal = new Web3Modal( {
  cacheProvider: true, // optional
  providerOptions, // required,
})

function App() {
  const [ provider, setProvider ] = useState();
  const [ library, setLibrary ] = useState();
  const [ account, setAccount ]  = useState();
  const [ error, setError ] = useState();
  const [ chainId, setChainId ] = useState();
  const [ network, setNetwork  ] = useState();

  const connectWallet = async() => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider( provider );
      setLibrary( library );
      if ( accounts ) setAccount( accounts[0] );
      setChainId( network.chainId );
    } catch ( error ) {
      setError( error );
    }
  }

  const handleNetwork = ( e ) => {
    const id = e.target.value;
    setNetwork( Number( id) );
  };

  const switchNetwork = async () => {
    try{
      await library.provider.request( {
        method: "wallet_switchEthereumChain",
        params: [ { chainId: toHex( network ) } ]
      });
    } catch ( switchError ) {
      if ( switchError.code === 4902 ) {
        try {
          await library.provider.request( {
            method: "wallet_addEthereumChain",
            params: [ networkParams[ toHex( network ) ] ]
          });
        } catch ( error ) {
          setError( error );
        }
      }
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork();
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect( () => {
    if ( web3Modal.cachedProvider ) {
      connectWallet();
    }
  }, [ ] );

  useEffect( () => {
    if ( provider?.on ) {
      const handleAccountsChanged = ( accounts ) => {
        console.log( "accountsChanged", accounts );
        if ( accounts ) setAccount( accounts[ 0 ] );
      };

      const handleChainChanged = ( _hexChainId ) => {
        setChainId( _hexChainId );
      };

      const handleDisconnect = () => {
        console.log( "disconnect", error );
        disconnect();
      };

      provider.on( "accountsChanged", handleAccountsChanged );
      provider.on( "chainChanged", handleChainChanged  );
      provider.on( "disconnect", handleDisconnect );

      return () => {
        if( provider.removeListener ) {
          provider.removeListener( "accountsChanged", handleAccountsChanged );
          provider.removeListener( "chainChanged", handleChainChanged  );
          provider.removeListener( "disconnect", handleDisconnect );
        }
      };
    }
  }, [ provider ] );

  const goDark = async () => {
    await web3Modal.updateTheme( "dark" );
  }


  return (
    <>
      {account && (
        <HStack position="absolute" top={0} right="15px">
          <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            padding="10px"
          >
            <VStack>
              <Select placeholder="Select network" onChange={handleNetwork}>
                <option value="1">Ethereum</option>
                <option value="137">Polygon</option>
                <option value="5">Goerli</option>
                <option value="4">Rinkeby</option>
              </Select>
              <Button onClick={switchNetwork} isDisabled={!network}>
                Switch Network
              </Button>
              <Button onClick={ goDark } >DarkMode</Button>
            </VStack>
          </Box>
        </HStack>
      )}
      <VStack justifyContent="center" alignItems="center" h="100vh">

        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
        <Text>{error ? error.message : null}</Text>
      </VStack>
    </>
  );
}

export default App;
