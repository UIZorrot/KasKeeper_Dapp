import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { Button, Card, Input, Radio, Row, Select } from 'antd';
import DeployKrc20 from './DeployKrc20';
import MintKRC20 from './MintKRC20';
import IssueKrc20 from './IssueKrc20';
import BurnKrc20 from './BurnKrc20';
import ChownKrc20 from './Chown';
import BlacklistKrc20 from './BlacklistKrc20';
import ClaimERC20 from './ClaimERC20';
export const randomString = (len = 4) => {
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZ';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

export enum TxType {
  SIGN_TX,
  SEND_KASPA,
  SIGN_KRC20_DEPLOY,
  SIGN_KRC20_MINT,
  SIGN_KRC20_TRANSFER
}

export interface BatchTransferRes {
  index?: number;
  tick?: string;
  to?: string;
  amount?: number;
  status:
  | 'success'
  | 'failed'
  | 'preparing 20%'
  | 'preparing 40%'
  | 'preparing 60%'
  | 'preparing 80%'
  | 'preparing 100%';

  errorMsg?: string;
  txId?: { commitId: string; revealId: string };
}

function App() {

  
  const Kaskeeper = (window as any).Kaskeeper;


  const [KaskeeperInstalled, setKaskeeperInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0
  });
  const [network, setNetwork] = useState('');
  const [batchTransferProgress, setBatchTransferProgress] = useState<BatchTransferRes | undefined>(undefined);
  const [krc20Balances, setKrc20Balances] = useState<any[]>([]);
  const [layer, setLayer] = useState('L1');

  const getPublicKey = useCallback(() => {
    Kaskeeper.getPublicKey().then((publicKey:string) => {
      setPublicKey(publicKey);
    }).catch((error:any) => {
      console.log('getPublicKey error', error)
    });
  }, [Kaskeeper, layer])

  const getKRC20Balance = useCallback(() => {
    Kaskeeper.getKRC20Balance().then((krc20Balances:any) => {
      setKrc20Balances(krc20Balances.balance || [])
      console.log('getKRC20Balance', krc20Balances);
    }).catch((error:any) => {
      console.log('getKRC20Balance error', error)
      setKrc20Balances([])
    });
  }, [Kaskeeper])

  const getBalance = useCallback(() => {
    Kaskeeper.getBalance().then((balance: any) => {
      console.log('balance', balance)
      setBalance(balance);
    }).catch((error:any) => {
      console.log('getBalance error', error)
    });
  }, [Kaskeeper]);

  useEffect(() => {
    if (!network || !address || !Kaskeeper) return
    // console.log('App mounted', network, address);
    getPublicKey()
    getKRC20Balance()
    getBalance()
  }, [Kaskeeper, address, getBalance, getKRC20Balance, getPublicKey, network, layer]);

  const getNetwork = useCallback(() => {
    const Kaskeeper = (window as any).Kaskeeper;
    Kaskeeper.getNetwork().then((network: string) => {
      console.log('getNetwork', network);
      setNetwork(network);
    }).catch((error:any) => {
      console.log('getNetwork error', error)
    });
  }, [])

  const getLayer = useCallback(() => {
    const Kaskeeper = (window as any).Kaskeeper;
    Kaskeeper.getLayer().then((layer: string) => {
      // console.log('获取 layer', layer)
      setLayer(layer);
    }).catch((error:any) => {
      console.log('getLayer error', error)
    });
  }, [])

  const getAccounts = useCallback(() => {
    const Kaskeeper = (window as any).Kaskeeper;
    Kaskeeper.getAccounts().then(([address]: string[]) => {
      setAddress(address)
    }).catch((error:any) => {
      console.log('getAccounts error', error)
    });
  }, [])

  const getBasicInfo = useCallback(async () => {
    // if (!Kaskeeper) return;
    try {
      await getLayer()
      await getAccounts()
      await getNetwork()
    } catch (error) {
      console.log('getBasicInfo error', error)
    }
  }, [getAccounts, getNetwork, getLayer])

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: []
  });
  const self = selfRef.current;
  const handleAccountsChanged = useCallback((_accounts: string[]) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  }, [getBasicInfo, self]);

  const handleNetworkChanged = useCallback((network: string) => {
    console.log('network', network);
    setNetwork(network);
    getBasicInfo();
  }, [getBasicInfo]);

  const handleLayerChanged = useCallback((layer: string) => {
    getBasicInfo();
  }, [getBasicInfo]);

  const handleKRC20BatchTransferChangedChanged = (ress: BatchTransferRes[]) => {
    ress.forEach((res) => {
      console.log('result', res.status, res?.index, res?.txId?.revealId, res?.errorMsg);
      setBatchTransferProgress(res);
    });
  };

  useEffect(() => {
    async function checkKaskeeper() {
      let Kaskeeper = (window as any).Kaskeeper;

      for (let i = 1; i < 10 && !Kaskeeper; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * i));
        Kaskeeper = (window as any).Kaskeeper;
      }

      if (Kaskeeper) {
        setKaskeeperInstalled(true);
      } else if (!Kaskeeper) return;

      Kaskeeper.getAccounts().then((accounts: string[]) => {
        console.log('accounts', accounts)
        handleAccountsChanged(accounts);
      });

      Kaskeeper.on('accountsChanged', handleAccountsChanged);
      Kaskeeper.on('networkChanged', handleNetworkChanged);
      Kaskeeper.on('krc20BatchTransferChanged', handleKRC20BatchTransferChangedChanged);
      Kaskeeper.on('layerChanged', handleLayerChanged);

      return () => {
        Kaskeeper.removeListener('accountsChanged', handleAccountsChanged);
        Kaskeeper.removeListener('networkChanged', handleNetworkChanged);
        Kaskeeper.removeListener('krc20BatchTransferChanged', handleKRC20BatchTransferChangedChanged);
        Kaskeeper.removeListener('layerChanged', handleLayerChanged);
      };
    }

    checkKaskeeper().then();
  }, [handleAccountsChanged, handleNetworkChanged, handleLayerChanged]);

  if (!KaskeeperInstalled) {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <Button
              onClick={() => {
                window.location.href = 'https://kaskeeper.vercel.app';
              }}>
              Install Kaskeeper Wallet
            </Button>
          </div>
        </header>
      </div>
    );
  }
  return (
    <div className="App">
      <header className="App-header">
        <p>Kaskeeper Wallet Demo</p>
        {connected ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
            <Button
              onClick={async () => {
                console.log('Kaskeeper', Kaskeeper)
                await Kaskeeper.disconnect();
                handleAccountsChanged([]);
              }}>
              Disconnect Kaskeeper Wallet
            </Button>

            <Card size="small" title="Layer" style={{ width: 300, margin: 10 }}>
              <Radio.Group
                onChange={async (e) => {
                  try {
                    const layer = await Kaskeeper.switchLayer(e.target.value);
                    console.log('layer', layer, e.target.value);
                    setLayer(e.target.value)
                  } catch (error) {
                    console.log('error', error)
                  }
                }}
                value={layer}>
                <Radio value={'L1'}>L1</Radio>
                <Radio value={'L2'}>L2</Radio>
              </Radio.Group>
            </Card>

            <Card size="small" title="Basic Info" style={{ width: 300, margin: 10 }}>
              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <div style={{ fontWeight: 'bold' }}>Address:</div>
                <div style={{ wordWrap: 'break-word' }}>{address}</div>
              </div>

              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <div style={{ fontWeight: 'bold' }}>PublicKey:</div>
                <div style={{ wordWrap: 'break-word' }}>{publicKey}</div>
              </div>

              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <div style={{ fontWeight: 'bold' }}>Balance: (kasAmount)</div>
                <div style={{ wordWrap: 'break-word' }}>{layer === 'L2' ? balance.total : (balance.total / 100000000)}</div>
              </div>
            </Card>

            <Card size="small" title="Switch Network" style={{ width: 300, margin: 10 }}>
              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <div style={{ fontWeight: 'bold' }}>Network:</div>
                <Radio.Group
                  onChange={async (e) => {
                    try {
                      const network = await Kaskeeper.switchNetwork(e.target.value);
                      console.log('network', network);
                      setNetwork(network);
                    } catch (error) {
                      
                    }
                  }}
                  value={network}>
                  <Radio value={'kaspa_mainnet'}>mainnet</Radio>
                  <Radio value={'kaspa_testnet'}>testnet-10</Radio>
                </Radio.Group>
              </div>
            </Card>
            <Krc20Balances krc20Balances={krc20Balances} layer={layer} />
            <SignMessageCard />
            <VerifyMessageCard publicKey={publicKey} />
            <SendKaspa
              krc20Balances={krc20Balances}
              getBalance={getBalance}
              layer={layer}
              getKRC20Balance={getKRC20Balance}
            />
            {
              layer === 'L2' && <ClaimERC20 address={address} getKRC20Balance={getKRC20Balance}/>
            }
            {
              layer === 'L1' && (
                <>
                <DeployKrc20 />
                <MintKRC20 />
                <IssueKrc20 />
                <BurnKrc20 />
                <ChownKrc20 />
                <BlacklistKrc20 />
                <TransferKRC20 krc20Balances={krc20Balances} getKRC20Balance={getKRC20Balance}/>
                </>
              )
            }
            {/* <DeployKRC20 /> */}
            {/* 
            <MintKRC20 />
            <BatchTransferKRC20V2 batchTransferProgress={batchTransferProgress} /> */}
          </div>
        ) : (
          <div>
            <Button
              onClick={async () => {
                const result = await Kaskeeper.requestAccounts();
                console.log('result', result)
                handleAccountsChanged(result);
              }}>
              Connect Kaskeeper Wallet
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}

function Krc20Balances({krc20Balances, layer}: {krc20Balances:any[], layer:string}) {
  // const [message, setMessage] = useState('hello world~');
  const Kaskeeper = (window as any).Kaskeeper;
  return (
    <Card
      size="small"
      title={`${layer === "L2" ? "E" : "K"}rc20 Balances`}
      style={{ width: 300, margin: 10 }}
    >
      {
        krc20Balances?.map((item, index) => {
          return (
            <Row key={index} className='flex' justify={'space-between'}>
              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <span style={{ fontWeight: 'bold' }}>{item.tick}: </span>
                <span style={{ wordWrap: 'break-word' }}>{item.balance / 10 ** item.dec}</span>
              </div>
            </Row>
          )
        })
      }
    </Card>
  );
}

function SignMessageCard() {
  const [message, setMessage] = useState('hello world~');
  const [signature, setSignature] = useState('');
  return (
    <Card size="small" title="Sign Message" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Message:</div>
        <Input
          defaultValue={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Signature:</div>
        <div style={{ wordWrap: 'break-word' }}>{signature}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          const signature = await (window as any).Kaskeeper.signMessage(message);
          setSignature(signature);
        }}>
        Sign Message
      </Button>
    </Card>
  );
}

function VerifyMessageCard({ publicKey }: { publicKey: string }) {
  const [message, setMessage] = useState('hello world~');
  const [signature, setSignature] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  return (
    <Card size="small" title="Sign Message" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Message:</div>
        <Input
          defaultValue={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Signature:</div>
        <Input
          defaultValue={signature}
          onChange={(e) => {
            setSignature(e.target.value);
          }}></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>is verified?:</div>
        <div style={{ wordWrap: 'break-word' }}>{isVerified ? 'true' : 'false'}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const isVerified = await (window as any).Kaskeeper.verifyMessage(message, signature);
            setIsVerified(isVerified);
          } catch (error) {
            setIsVerified(false);
          }
        }}>
        Verify Message
      </Button>
    </Card>
  );
}

function SendKaspa({krc20Balances, getBalance, layer, getKRC20Balance}:{
  krc20Balances: any[],
  getBalance: () => void,
  layer: string,
  getKRC20Balance: () => void,
}) {
  const [toAddress, setToAddress] = useState('');
  const [kasAmount, setKasAmount] = useState(1);
  const [txid, setTxid] = useState('');
  const [type, setType] = useState('');
  const [tick, setTick] = useState('');
  const [unsignedTx, setUnsignedTx] = useState<any>('');
  const [payload, setPayload] = useState('hello world');

  useEffect(() => {
    setToAddress(layer === 'L2' ? '0x174E1E965fA336C818a8B351724010Dd4A096a8b' : 'kaspatest:qz7unmnjvr3dh7ws6ugefhwtsc2p5hf2fe5qqvk5grz5z92qzfv922zsy8tlj')
  }, [layer])

  return (
    <Card size="small" title="Send kaspa" style={{ width: 300, margin: 10 }}>
      {
        !['L2PayloadTransfer'].includes(type) && (
          <div style={{ textAlign: 'left', marginTop: 10 }}>
            <div style={{ fontWeight: 'bold' }}>Receiver Address:</div>
            <Input.TextArea
              value={toAddress}
              rows={2}
              // defaultValue={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value);
              }}></Input.TextArea>
          </div>
        )
      }

      {
        !['L2PayloadTransfer'].includes(type) && (
          <div style={{ textAlign: 'left', marginTop: 10 }}>
            <div style={{ fontWeight: 'bold' }}>Amount: (KAS)</div>
            <Input
              defaultValue={kasAmount}
              onChange={(e) => {
                setKasAmount(Number(e.target.value));
              }}></Input>
          </div>
        )
      }

      {
        layer === 'L2' && <>
          <div style={{ textAlign: 'left', marginTop: 10 }}>
            <div style={{ fontWeight: 'bold' }}>type:</div>
          </div>
          <Select
            defaultValue={type}
            style={{ width: '100%', textAlign: 'left' }}
            options={[
              { value: 'L2Kaspa', label: 'L2Kaspa' },
              { value: 'L2PayloadTransfer', label: 'L2PayloadTransfer' },
              { value: 'L2Erc20Transfer', label: 'L2Erc20Transfer' },
              // { value: 'l2ERC20', label: 'L2ERC20' },
              // { value: 'l2Specailtx', label: 'L2Specailtx' }
            ]}
            onChange={(value) => {
              setType(value);
              setTick('');
            }}
          />
        </>
      }

      {
        ['L2Erc20Transfer', 'l2Specailtx'].includes(type) && (
          <div style={{ textAlign: 'left', marginTop: 10 }}>
            <div style={{ fontWeight: 'bold' }}>tick:</div>
            <Select value={tick} allowClear onChange={value => {
              setTick(value);
            }} style={{width:'100%'}}>
              {
                krc20Balances?.map((item, index) => {
                  return <Select.Option key={index} value={item.contractAddress}>{item.tick} ({item.balance / 10 ** item.dec})</Select.Option>
                })
              }
            </Select>
          </div>
        )
      }

      {
        ['L2PayloadTransfer', 'l2ERC20'].includes(type) && (
          <div style={{ textAlign: 'left', marginTop: 10 }}>
            <div style={{ fontWeight: 'bold' }}>unsignedTx</div>
            <Input.TextArea
              autoSize={{ minRows: 10 }}
              defaultValue={unsignedTx}
              onChange={(e) => {
                setUnsignedTx(e.target.value);
              }} />
          </div>
        )
      }
      {layer === 'L1' && 
        <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>payload:</div>
        <Input
          value={payload}
          // defaultValue={toAddress}
          onChange={(e) => {
            setPayload(e.target.value);
          }}></Input>
      </div>
      }

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            if (layer === 'L2') {
                console.log('l2ERC20', type)
              let txid = '';
              if (type === 'L2Kaspa') {
                txid = await (window as any).Kaskeeper.sendL2Kaspa(toAddress, kasAmount * (10 ** 18), {
                  feeRate: '0.000021',
                });
              } else if (type === 'L2PayloadTransfer') {
                console.log('erc20Params', JSON.parse(unsignedTx))
                txid = await (window as any).Kaskeeper.L2PayloadTransfer(JSON.parse(unsignedTx), {
                  feeRate: '0.000021',
                });
                setTimeout(() => {
                  getKRC20Balance();
                }, 4000);
                console.log('txid', txid)
              } else if (type === 'l2ERC20') {
                txid = await (window as any).Kaskeeper.sendL2ERC20(JSON.parse(unsignedTx), {
                  feeRate: '0.000021',
                });
              } else if (type === 'L2Erc20Transfer') {
                const tokenContractAddress = tick;
                txid = await (window as any).Kaskeeper.L2Erc20Transfer(toAddress, (kasAmount * ( 10 ** 18)), tokenContractAddress, {
                  feeRate: '0.000021',
                });
              } else if (type === 'l2Specailtx') {
                const tokenContractAddress = tick;
                txid = await (window as any).Kaskeeper.sendL2Specailtx(toAddress, (kasAmount * ( 10 ** 18)), tokenContractAddress, {
                  feeRate: '0.000021',
                });
              }
              setTxid(txid);
              // setTimeout(() => {
              //   getBalance();
              // }, 2000);
  
              getBalance();
            } else {
              const txid = await (window as any).Kaskeeper.sendKaspa(toAddress, kasAmount * (10 ** 8), {
                feeRate: 1, // '0.000021',
                payload: payload || ''
              });
              setTxid(txid);
              // setTimeout(() => {
              //   getBalance();
              // }, 2000);
  
              getBalance();
            }
          } catch (e) {
                console.log('txid', e)
            setTxid((e as any).message);
          }
        }}>
        SendKaspa
      </Button>
    </Card>
  );
}
function TransferKRC20({krc20Balances, getKRC20Balance}: {
  krc20Balances: any[],
  getKRC20Balance: () => void
}) {

  const Kaskeeper = (window as any).Kaskeeper;
  const [amount, setAmount] = useState(1);
  const [toAddress, setToAddress] = useState('kaspatest:qz7unmnjvr3dh7ws6ugefhwtsc2p5hf2fe5qqvk5grz5z92qzfv922zsy8tlj');
  const [tick, setTick] = useState('');
  const [txid, setTxid] = useState('');
  const handleTransfer = async () => {
    // kas unit
    // const priorityFee = 0.1;
    const krc20Details = krc20Balances.find(item => item.tick === tick) || {};
    const txid = await Kaskeeper.sendKRC200(
      toAddress,
      amount,
      krc20Details,
      {
        priorityFee: 10000
      }
    );
    setTimeout(() => {
      getKRC20Balance()
    }, 2000)
    // getKRC20Balance()
    console.log('txid', txid);
    setTxid(txid);
  };
  return (
    <Card size="small" title="Transfer KRC20" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Receiver Address:</div>
        <Input.TextArea
          defaultValue={toAddress}
          onChange={(e) => {
            setToAddress(e.target.value);
          }}/>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>tick:</div>
        <Select value={tick} allowClear onChange={value => {
          console.log('value', value);
          setTick(value);
        }} style={{width:'100%'}}>
          {
            krc20Balances?.map((item, index) => {
              return <Select.Option key={index} value={item.tick}>{item.tick} ({item.balance / 10 ** item.dec})</Select.Option>
            })
          }
        </Select>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Amount:</div>
        <Input
          defaultValue={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
          }}></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleTransfer();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Send KRC20 Token
      </Button>
    </Card>
  );
}
function BatchTransferKRC20V2({ batchTransferProgress }: { batchTransferProgress: BatchTransferRes | undefined }) {
  const [txid, setTxid] = useState('');

  const handleBatchTransfer2 = async () => {

    let list = [
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.2
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.3
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.4
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.5
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.6
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.7
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.8
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 0.9
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.2
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.3
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.4
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.5
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.6
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.7
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.8
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 1.9
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.2
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.3
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.4
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.5
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.6
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.7
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.8
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 2.9
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.2
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.3
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.4
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.5
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.6
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.7
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.8
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 3.9
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 4
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 4.1
      },
      {
        tick: 'tesla',
        to: 'kaspatest:qz45kwyswwpsedqqv3lm3hq3de4c5uwp0cwqnwn74medm4uxzmesvksw9fuyx',
        amount: 4.2
      }
    ];

    //  the kas balance should be larger than 30 kas in order to start batch transfer.
    const result = await (window as any).Kaskeeper.krc20BatchTransferTransaction(list);
    // the function above should work with handleKRC20BatchTransferChangedChanged event.
    // krc20BatchTransferTransaction() is called, handleKRC20BatchTransferChangedChanged event will monitor activities and return any latest successful/failed result.
    setTxid(result);
  };
  return (
    <Card size="small" title="Batch Transfer KRC20 V2" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>status:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.status}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>index:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.index}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>tick:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.tick}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>to:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.to}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>amount:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.amount}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>errorMsg:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.errorMsg}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold' }}>txId:</div>
        <div style={{ wordWrap: 'break-word' }}>{batchTransferProgress?.txId?.revealId}</div>
      </div>

      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleBatchTransfer2();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Batch Transfer KRC20 Token V2
      </Button>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          await (window as any).Kaskeeper.cancelKRC20BatchTransfer();
        }}>
        Cancel
      </Button>
    </Card>
  );
}

export default App
