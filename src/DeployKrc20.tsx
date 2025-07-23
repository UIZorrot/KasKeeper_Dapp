import { Alert, Button, Card, Input, InputNumber, Switch, Typography } from "antd"
import { useEffect, useState } from "react";
import { randomString, TxType } from "./App";

const DeployKrc20 = () => {
  // let deployJsonString ='{"p":"KRC-20","op":"deploy","tick":"BBBB","max":"21000000000000000000000000000000","lim":"100000000000000000000"}';
  const [ticker, setTicker] = useState('');
  const [supply, setSupply] = useState(100000000);
  const [lim, setLim] = useState(100);
  const [txid, setTxid] = useState('');
  const [decimals, setDecimals] = useState<number>(8);
  const [isIssue, setIsIssue] = useState<boolean>(false);
  const [fee, setFee] = useState<number>(0.01);
  const handleDeployment = async () => {
    // kas unit
    const data = {
      type: 'deploy',
      playload: {
        ticker: ticker,
        max: (supply * 10 ** decimals).toString(),
        lim: (lim * 10 ** decimals).toString(),
        dec: decimals,
        mode: isIssue ? 'issue' : '',
        priorityFeeValue: fee // 2 * 10 ** decimals
      }
    }
    const txids = await (window as any).Kaskeeper.signKRC20Transaction(data);
    setTxid(txids);
  };

  useEffect(() => {
    const tempTick = randomString();
    console.log('temptick', tempTick);
    setTicker(tempTick);
  }, []);
  return (
    <Card size="small" title="Deploy KRC20" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Ticker:</div>
        <Input
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value);
          }}></Input>
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Decimals: </div>
        <InputNumber
          value={decimals}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setDecimals(() => value || 8);
          }}/>
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Max Supply: </div>
        <InputNumber
          value={supply}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setSupply(value || 1);
          }}/>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Amount per mint: </div>
        <InputNumber
          value={lim}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setLim(value || 1);
          }}/>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Issue Mode: </div>
        <Switch value={isIssue} onChange={e => setIsIssue(e)} />
        {/* <InputNumber
          value={lim}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setLim(value || 1);
          }}/> */}
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Priority Fee (KAS): </div>
        <InputNumber
          value={fee}
          type="number"
          precision={2}
          min={0.01}
          style={{width: '100%'}}
          onChange={(value) => {
            setFee(value || 0.01);
          }}/>
      <Typography.Text style={{ textAlign: 'left' }} type="warning">If deploy fails, increase the Priority Fee and try again</Typography.Text>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleDeployment();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Deploy
      </Button>
    </Card>
  );
}

export default DeployKrc20