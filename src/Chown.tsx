import { Button, Card, Input } from "antd"
import { useEffect, useState } from "react";

const ChownKrc20 = () => {
  const [txid, setTxid] = useState('');

  const [formData, setFormData] = useState({
    ticker: '2120502e0717815c78161b6e9fc2c19183ec25900093be5fa5c079c3b43992b8',
    recipient: 'kaspatest:qz7unmnjvr3dh7ws6ugefhwtsc2p5hf2fe5qqvk5grz5z92qzfv922zsy8tlj'
  });
  const handleChown = async () => {
    // kas unit
    const data = {
      type: 'chown',
      playload: {
        ...formData,
        priorityFeeValue: 0.01
      }
    }
    const txids = await (window as any).Kaskeeper.signKRC20Transaction(data);
    console.log('handleChown', txids);
    setTxid(txids);
  };

  useEffect(() => {
  }, []);

  return (
    <Card size="small" title="Chown KRC20" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Ticker:</div>
        <Input.TextArea
          value={formData.ticker}
          onChange={(e) => {
            setFormData({
              ...formData,
              ticker: e.target.value,
            });
          }} />
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Recipient:</div>
        <Input.TextArea
          value={formData.recipient}
          onChange={(e) => {
            setFormData({
              ...formData,
              recipient: e.target.value,
            });
          }} />
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleChown();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Chown
      </Button>
    </Card>
  );
}

export default ChownKrc20