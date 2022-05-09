// in this app we are using react context api here we will be creating all the variables and will call them wherever
// required by making them global

import { createContext, useState, useEffect } from 'react'
import { useMoralis, useMoralisQuery } from 'react-moralis'
//  for functionality to buy the AC tokens  
import {amazonAbi,amazonCoinAddress} from '../lib/constants'
import { ethers } from 'ethers'

export const AmazonContext = createContext()

export const AmazonProvider = ({ children }) => {
// username is same as the that in sidebar and the nickname and setNickname is for the input field for setting up thr username 
    const[username,setUsername] = useState('')
    const[nickname,setNickname] = useState('')
    // here we are going to store out data from the database
    const [assets,setAssets] = useState([])
    const [currentAccount, setCurrentAccount] = useState('')
    const [tokenAmount,setTokenAmount] = useState('')
    const [amountDue,setAmountDue] = useState('')
    const [etherscanLink,setEtherscanLink] = useState('')
    const [isLoading,setIsLoading] = useState('')
    const [balance,setBalance] = useState('')
    const [recentTransactions,setRecentTransactions] = useState([])
    const [ownedItems, setOwnedItems] = useState([])

    const {
        authenticate,
        isAuthenticated,
        enableWeb3,
        Moralis,
        user,
        isWeb3Enabled,
      } = useMoralis()
    
    //   const {
    //     data: userData,
    //     error: userDataError,
    //     isLoading: userDataIsLoading,
    //   } = useMoralisQuery('_User')

    //   querying moralisDB -> "assets" is the name of our class inside the moralsiDB
    const{
        // going to get all these things from the moralis query->
        data: assetsData,
        error: assetsDataError,
        isLoading: assetsDataIsLoading,
    } = useMoralisQuery('assets')

// querying for the user who is currently loggedIn so that can show assets they owns -> 
const {
data:userData,
error: userDataError,
isLoading: userDataIsLoading
} = useMoralisQuery('_User')

  // if any change will update ->
  const listenToUpdates = async () => {
    let query = new Moralis.Query('EthTransactions')
    let subscription = await query.subscribe()
    subscription.on('update', async object => {
        console.log('new transaction');
        console.log(object);
        setRecentTransactions([object])
    })
}

   const getBalance = async () => {
        try {
            if (!isAuthenticated || !currentAccount) return 
                const options = {
                    // RHS have smart-contract we want our code to talk to
                    contractAddress : amazonCoinAddress,
                    // the function of the smart contract we want to use we are using the openzeplin balanceOf function 
                    // which is predefined in it
                    functionName: 'balanceOf',
                    abi:amazonAbi,
                    params:{
                        account: currentAccount
                    }
                }

                if (isWeb3Enabled) {
                    const response = await Moralis.executeFunction(options)
                    setBalance(response.toString())
                }
            
        } catch (error) {
            console.log(error);
        }
    }


    // setting up useEffect to fetch the username from the database whenever connect the wallet ->
    useEffect(()=>{
        ;(async()=>{
            // isAuthenticated we are using from the moralis to know if the user is signedIn or not
        if(isAuthenticated){
            await getBalance()
            await listenToUpdates()
            // through the below line of code we will be getting the nickname of the user from the moralis database
         const currentUsername = await user?.get('nickname')
        //  if the nickname is already defined it will show that and if isn't defined then will show the input field
         setUsername(currentUsername)
         const account = await user?.get('ethAddress')
         setCurrentAccount(account)
        }
        })()
        // [] inside this i have defined all the parameters upon whose change the useEffect will run
    },[isAuthenticated, user, username,currentAccount,getBalance,listenToUpdates])

    // useEffect which calls getAssets and getOwnedAssets function ->
    useEffect(() => {
        ;(async() => {
            if (isWeb3Enabled) {
                await getAssets()
                await getOwnedAssets()
            }
        })()
    },[isWeb3Enabled,assetsData,assetsDataIsLoading])

    // making a function so that we can set our username using the set nickname button ->
    const handleSetUsername = () => {
        // when i click on the set nickname it will check whether any user is connected to our app or not ->
        if (user) {
            // in this below if it will check if there is anything in the input field if any thing is there then it will 
            // create a column in the moralisDB named nickname and then store the input 
            if (nickname) {
                user.set('nickname',nickname)
                // to save it in the DB
                user.save()
                // to clear the input field
                setNickname('')
            }else{
                console.log("can't set empty nickname")
            }
        }else{
            console.log("no user");
        }
    }

 const buyAsset =  async (price,asset) => {
     try {
        if (!isAuthenticated) return
        // sending nftcoin we have to smart contract in order to purchase assets 
        const options = 
        {
            type: 'erc20',
            amount: price,
            receiver : amazonCoinAddress,
            contractAddress: amazonCoinAddress
        }         

        let transaction = await Moralis.transfer(options)
        const receipt = await transaction.wait()

        // adding owned assets of the user to the database ->
        if (receipt) {
            const res = userData[0].add('ownedAssets',{
                ...asset,
                purchaseDate: Date.now(),
                etherscanLink: `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`
            })
            await res.save().then(()=>{
                alert("Congrats!! You have successfully purchased this asset!")
            })
        }


     } catch (error) {
         console.log(error);
     }
 }

    // function which will let us buy token in exchange of eth ->
    const buyTokens = async() =>{
        // if user is not loggedIn then it will prompt user to login
        if (!isAuthenticated) {
            await authenticate()
        }

        const amount = ethers.BigNumber.from(tokenAmount)
        // deciding how many eth 1token of ours cost 
        const price = ethers.BigNumber.from('100000000000000')
        const calcPrice = amount.mul(price)

        let options = {
            contractAddress:amazonCoinAddress,
            functionName: 'mint',
            abi:amazonAbi,
            msgValue:calcPrice,
            params:{
                amount,
            },
        }

        const transition = await Moralis.executeFunction(options)
        // the 4 inside wait means that its going to wait for 4 blocks to be verified before finishing the transaction
        const receipt = await transition.wait(4)
        setIsLoading(false)
        console.log(receipt)
        setEtherscanLink(
            `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
        )

    }

  

// assetsData is what we are querying from moralisDB
    const getAssets = async () => {
        try {
            await enableWeb3()
            setAssets(assetsData)

        } catch (error) {
            console.log(error);
        }
    }

    const getOwnedAssets = async () => {
        try {
            // checking for currently loggedIN account
            if (userData[0].attributes.getAssets) {
                setOwnedItems(prevItems => [
                    ...prevItems,userData[0].attributes.getOwnedAssets
                ])
            }
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <AmazonContext.Provider
        // anything inside value { } will be global
        value = {{
            // all these variables are now globally present to be used
        isAuthenticated,
        nickname,
        setNickname,
        username,
        handleSetUsername,
        assets,
        balance,
        setTokenAmount,
        tokenAmount,
        amountDue,
        setAmountDue,
        isLoading,
        setIsLoading,
        setEtherscanLink,
        etherscanLink,
        currentAccount,
        buyTokens,
        buyAsset,
        recentTransactions,
        ownedItems,
    }}
        >
            {children}
        </AmazonContext.Provider>
    )
}