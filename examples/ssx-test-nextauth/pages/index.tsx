import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSSX } from "@spruceid/ssx-react";
import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useSigner } from 'wagmi';


// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
// import { useSSX } from '@spruceid/ssx-react';
import { useConnect, useSignMessage } from "wagmi";
// import { useState } from "react";


// import type { NextPage } from 'next';
// import Head from 'next/head';
// import styles from '../styles/Home.module.css';

const Header = () => {
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { data: session, status } = useSession();
  const { ssx, ssxLoaded } = useSSX();
  const [provider, setProvider ] = useState<any>();
  const { data, isSuccess: providerLoaded } = (typeof window !==
    'undefined' &&
    useSigner()) || { data: undefined, isSuccess: false };
  
  const daoLogin = false;
  const resolveEns = false;
  
  const loading = status === "loading";
  console.log(session);
  console.log(status);

  const signer = async () => {
    if (provider) return;
    const res = await connectAsync({ connector: connectors[0] });
    setProvider(res);
  }

  const handleLoginSSX = async () => {
    const callbackUrl = "/protected";

    // need to get the csrf token from the server
    console.log("SSX Login");
    await ssx?.signIn();
    // console.log(siwe, signature);
    // signIn("credentials", { message: siwe, redirect: false, signature, callbackUrl });
  }
  const handleLogin = async () => {
    try {
      console.log(data)
      // const provider = data.provider;
      const callbackUrl = "/protected";
      const message = new SiweMessage({
        domain: window.location.host,
        address: await data?.getAddress(),
        statement: "Sign in with Ethereum",
        uri: window.location.origin,
        version: "1",
        chainId: (data as any)?.provider?.network?.chainId,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({ message: message.prepareMessage() });
      signIn("credentials", { message: message.prepareMessage() , redirect: false, signature, daoLogin, resolveEns, callbackUrl });
    } catch (error) {
      console.log(error)
      window.alert(error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
              <ConnectButton />

      {/* {!session && (
        <button style={{ backgroundColor: "gray", padding: "12px" }} onClick={connect}>
          Connect
        </button>
      )} */}
      {!session && (
        <button style={{ backgroundColor: "gray", padding: "12px" }} onClick={handleLogin} disabled={!providerLoaded}>
          SIWE
        </button>
      )}
      
      {session?.user && (
        <button
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
        >
          {session.user.name?.substring(0, 5)}...{session.user.name?.substring(session.user.name.length - 2, session.user.name.length)}
        </button>
      )}
    </div>
  );
};


const Home: NextPage = () => {
  const { ssx, ssxLoaded } = useSSX();
  const [address, setAddress] = useState<string>();


  const handleSignIn = async () => {
    await ssx?.signIn();
    setAddress(ssx?.address);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
        {/* <ConnectButton /> */}
      <main className={styles.main}>

        <h1 className={styles.title}>
          Welcome to <a href="">RainbowKit</a> + <a href="">wagmi</a> +{' '}
          <a href="https://docs.ssx.id/">SSX</a> + <a href="https://nextjs.org">Next.js</a> + <a href="https://next-auth.js.org/">NextAuth.js!</a>
        </h1>

        <p className={styles.description}>
          Sign-in with Ethereum powered by SSX
          <br/>
          <button onClick={handleSignIn} disabled={!ssxLoaded}>Sign Message</button>
        </p>
        {
          address && 
          <p className={styles.description}>
            Address: <code>{address}</code>
          </p>
        }
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
