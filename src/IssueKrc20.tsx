import { Button, Card, Input, InputNumber, Switch } from "antd"
import { useEffect, useState } from "react";

const IssueKrc20 = () => {
  const [txid, setTxid] = useState('');

  const [formData, setFormData] = useState({
    ticker: '2120502e0717815c78161b6e9fc2c19183ec25900093be5fa5c079c3b43992b8',
    recipient: 'kaspatest:qz7unmnjvr3dh7ws6ugefhwtsc2p5hf2fe5qqvk5grz5z92qzfv922zsy8tlj',
    issueAmount: 1
  });
  const handleIssue = async () => {
    // kas unit
    const data = {
      type: 'issue',
      playload: {
        ...formData,
        priorityFeeValue: 0.01
      }
    }
    const txids = await (window as any).Kaskeeper.signKRC20Transaction(data);
    console.log('handleIssue', txids);
    setTxid(txids);
  };

  useEffect(() => {
  }, []);

  return (
    <Card size="small" title="Issue KRC20" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Ticker:</div>
        <Input
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
        <Input
          value={formData.recipient}
          onChange={(e) => {
            setFormData({
              ...formData,
              recipient: e.target.value,
            });
          }} />
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Issue Amount: </div>
        <InputNumber
          value={formData.issueAmount}
          type="number"
          precision={0}
          min={1}
          style={{width: '100%'}}
          onChange={(value) => {
            setFormData({
              ...formData,
              issueAmount: value || 1,
            });
          }}/>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            await handleIssue();
          } catch (e) {
            setTxid((e as any).message);
          }
        }}>
        Issue
      </Button>
    </Card>
  );
}

export default IssueKrc20