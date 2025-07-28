import { Button, Card, Input, InputNumber, Switch } from "antd"
import { useEffect, useState } from "react";
import Web3, { ETH_DATA_FORMAT } from "web3";

const rpcUrl = 'https://rpc.kasplextest.xyz';
const contractAddress = '0x5Ef3136F4dc8683f6169023A589bdd598E4A7F8C'
const abi = [
	{
		"inputs": [],
		"name": "add_mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_receiver",
				"type": "address"
			}
		],
		"name": "requestTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "Receiver",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "Amount",
				"type": "uint256"
			}
		],
		"name": "SendToken",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "amountAllowed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastRequestTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "requestedAddress",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestInterval",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const ClaimERC20 = ({
  address,
  getKRC20Balance
} : {
  address: string,
  getKRC20Balance: () => void
}) => {
  const [txid, setTxid] = useState('');
	const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    address: '', // '0xE78685F28dF1Aedab0d22cA3a1Dd1A43F07Ab614'
  });
	useEffect(() => {
    setFormData({
			address: address
		})
	}, [address])
  const handleClaim = async () => {
		if (!formData.address) return
		// const web3 = new Web3(rpcUrl)
		// const contract = new web3.eth.Contract(abi, contractAddress);
		// const balance = await contract.methods.balanceOf(contractAddress).call()
		// console.log('balance', balance)

		try {
			setLoading(true)
			const data = await (window as any).Kaskeeper.claimTestErc20(formData.address)
			console.log('Faucet calim data', data)
			setTxid(data?.txId)
			if (address === formData.address && getKRC20Balance) getKRC20Balance()
		} catch (error:any) {
			console.log('error', error)
			setTxid(error?.message || error as string)
		} finally {
			setLoading(false)
		}
		
    // 连接rpc
    // try {
    //   if (!formData.address || !address) return
    //   const web3 = new Web3(rpcUrl)
    //   const contract = new web3.eth.Contract(abi, contractAddress);
    //   const gasPrice = await web3.eth.getGasPrice();
    //   const gasLimit = await contract.methods.requestTokens(formData.address).estimateGas();
      
    //   const tx = {
    //     from: '0xE78685F28dF1Aedab0d22cA3a1Dd1A43F07Ab614',
    //     to: contractAddress,
    //     gas: gasLimit,
    //     gasPrice,
    //     data: contract.methods.requestTokens(formData.address).encodeABI()
    //   }
    //   console.log('gasLimit', tx)
    //   const signedTx = await web3.eth.accounts.signTransaction(tx, '0x4350f2a05179f86b9641d0996c6f8654d5924c828c5247018c28a84b99b87c44')
    //   const txResponse = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    //   console.log('contract.methods', signedTx, txResponse)
		// 	setTxid(txResponse?.transactionHash as string)
    //   if (address === formData.address && getKRC20Balance) getKRC20Balance()
    // } catch (error) {
    //   console.log('error', error)
		// 	setTxid(error as string)
    //   console.log('error', error?.message)
    // }
  };

  useEffect(() => {
  }, []);

  return (
    <Card size="small" title="TKASE Faucet" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Address:</div>
        <Input.TextArea
          value={formData.address}
          rows={2}
          onChange={(e) => {
            setFormData({
              ...formData,
              address: e.target.value,
            });
          }} />
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
				loading={loading}
        onClick={async () => {
          try {
            await handleClaim();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Claim 10 TKASE
      </Button>
    </Card>
  );
}

export default ClaimERC20