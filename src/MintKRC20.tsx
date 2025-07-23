import { Button, Card, Input, InputNumber, Typography } from "antd"
import { useEffect, useState } from "react";

function MintKRC20() {
  // let mintJsonString = '{\"p\":\"KRC-20\",\"op\":\"mint\",\"tick\":\"RBMV\"}'
  const [ticker, setTicker] = useState('RBMV');
  const [mintCount, setMintCount] = useState(1);
  const [fee, setFee] = useState<number>(0.01);

  const [result, setResult] = useState('');
  const handleMint = async () => {
    const data = {
      type: 'mint',
      playload: {
        ticker: ticker,
        mintCount: mintCount,
        priorityFeeValue: fee
      }
    }
    const result = await (window as any).Kaskeeper.signKRC20Transaction(data);
    setResult(result);
  };
  return (
    <Card size="small" title="Mint KRC20" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Ticker:</div>
        <Input
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value);
          }}></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Mint Count: </div>
        <InputNumber
          value={mintCount}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setMintCount(value || 1);
          }}/>
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
      <Typography.Text style={{ textAlign: 'left' }} type="warning">If mint fails, increase the Priority Fee and try again</Typography.Text>
      </div>
      
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>result:</div>
        <div style={{ wordWrap: 'break-word' }}>{result}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleMint();
          } catch (e) {
            setResult((e as any).message);
          }
        }}>
        Mint
      </Button>
    </Card>
  );
}

export default MintKRC20;