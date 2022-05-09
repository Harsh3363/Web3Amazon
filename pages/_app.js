import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
import {AmazonProvider} from '../context/AmazonContext'
import { ModalProvider } from 'react-simple-hook-modal'

function MyApp({ Component, pageProps }) {
  return (
    // to wrap whole nextJS inside moralis ->
  <MoralisProvider
  serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER}
  appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
  >
    {/* connecting the amazon context  */}
      <AmazonProvider>
        <ModalProvider>
    <Component {...pageProps} />
    </ModalProvider>
      </AmazonProvider>
  </MoralisProvider>
  
  )
}

export default MyApp
