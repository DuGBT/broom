import { useState, useEffect } from "react";
import { Button, Input, Form, Select } from "antd";
import { openAirDrop } from "./api";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "AKIAYXGKVB6EUMWBYMVT",
    secretAccessKey: "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",
  },
});

function Admin() {
  const [file, setFile] = useState();
  const [awsFileName, setAwsFileName] = useState("");
  const [form] = Form.useForm();

  const uploadFile = async () => {
    const uploadParams = {
      ACL: "public-read",
      Bucket: "famchat",
      Key: "broom/" + file.name,
      ContentType: file.type,
      Body: file,
    };
    try {
      const data = await s3.send(new PutObjectCommand(uploadParams));
      console.log("Success", data);
      setAwsFileName(
        "https://famchat.s3.ap-southeast-1.amazonaws.com/broom/" + file.name
      );
    } catch (err) {
      console.log("Error", err);
    }
  };

  const onFinish = async (value) => {
    try {
      console.log(value);
      value.rewards = value.rewards.map((item) => {
        return { ...item, amount: Number(item.amount) };
      });
      const param = { list: value.rewards };
      if (awsFileName.length > 0) {
        param.excel_file = awsFileName;
      }
      const res = await openAirDrop(param);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  const onReset = () => {
    form.resetFields();
  };
  return (
    <div
      style={{
        padding: "1rem",
        height: "100vh",
        background: "#fff",
        color: "#000",
      }}
    >
      <Form form={form} onFinish={onFinish}>
        <Form.List name="rewards" initialValue={[]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <Form.Item
                    {...restField}
                    name={[name, "address"]}
                    rules={[{ required: true, message: "Missing Address" }]}
                  >
                    <Input style={{ width: "400px" }} placeholder="Address" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "amount"]}
                    rules={[{ required: true, message: "Missing Amount" }]}
                  >
                    <Input style={{ width: "400px" }} placeholder="Amount" />
                  </Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => remove(name)}
                    style={{ marginLeft: 8 }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ marginTop: 8 }}
                >
                  Add New Reward
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item name="file">
          <Input
            type="file"
            onChange={(e) => {
              console.log(e);
              setFile(e.target.files[0]);
            }}
          ></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button
            onClick={() => {
              uploadFile();
            }}
          >
            upload
          </Button>
        </Form.Item>
      </Form>
      {awsFileName.length > 0 && <div>AWS file name:{awsFileName}</div>}
    </div>
  );
}

export default Admin;
