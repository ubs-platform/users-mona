import { Transport } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
export const getMicroserviceConnection = (groupName) => {
  const type = process.env['NX_MICROSERVICE_TYPE'] as 'KAFKA' | 'TCP' | 'RMQ';

  let microservice: Object | null = null;
  if (type == 'KAFKA') {
    microservice = {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'users',
          brokers: [`${process.env['NX_KAFKA_URL']}`],
        },
        consumer: {
          groupId: 'tk' + randomUUID(),
        },
      },
    };
  } else if (type == 'RMQ') {
    microservice = {
      transport: Transport.RMQ,
      options: {
        urls: [process.env['NX_RMQ_URL']],
        queue: 'cats_queue',
        queueOptions: {
          durable: false,
        },
      },
    };
  } else {
    microservice = {
      transport: Transport.TCP,
      options: {
        host: process.env['NX_TCP_HOST'],
        port: process.env['NX_TCP_PORT'],
      },
    };
  }

  // return {
  //   transport: Transport.TCP,
  //   options: {
  //     host: 'localhost',
  //     port: 7177,
  //   },
  // };
  if (microservice == null) {
    throw 'Microservice type not recognized';
  }
  return microservice;
};
// export const UserMicroserviceCommunication =

// // More 2 3 kafka clients are needed, comes replication invalid shit error
// export const UserMicroserviceCommunication =
