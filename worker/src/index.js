import { consumer } from "./kafka.js";
import { sendEmailTopic } from "./config.js";

export async function listenToQueue() {
  await consumer.connect();

  console.info("worker connected to kafka");

  await consumer.subscribe({
    topic: sendEmailTopic,
    fromBeginning: true,
  });

  console.info(`subcribed to topic=${sendEmailTopic}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (topic === sendEmailTopic) {
        const payload = JSON.parse(message.value);

        console.log(`Received topic=${topic}`, payload);
      } else {
        console.error(
          `Received unknown topic=${topic} on partition=${partition}`
        );
      }
    },
  });
}

listenToQueue();
