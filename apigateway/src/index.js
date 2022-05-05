import f from "fastify";
import { producer } from "./kafka.js";
import { sendEmailTopic } from "./config.js";
import { CompressionTypes } from "kafkajs";

const fastify = f({
  logger: false,
});

const createMessage = (topic, args) => ({
  key: topic,
  value: JSON.stringify(args),
  timestamp: Date.now(),
});

const sendEmail = async (topic, args) => {
  const message = createMessage(topic, args);

  await producer.connect();
  await producer.send({
    topic: topic,
    messages: [message],
    compression: CompressionTypes.GZIP,
  });

  console.info("sent message to email worker");

  await producer.disconnect();
};

fastify.get("/", async () => {
  setImmediate(async () => await sendEmail(sendEmailTopic, { foo: "bar" }));

  return { status: "ok" };
});

// Run the server!
const start = async () => {
  try {
    console.info("apigateway started on 3000");
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
