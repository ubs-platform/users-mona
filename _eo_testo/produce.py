from kafka import KafkaProducer
print("testo")
producer = KafkaProducer(bootstrap_servers='localhost:1234')
for _ in range(1):
    producer.send('foobar', b'some_message_bytes')
