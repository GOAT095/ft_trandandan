import "reflect-metadata"

import { Entity, DataSource, BaseEntity, Column, PrimaryColumn } from "typeorm";

import { User } from "./api/user/user.entity";
import { FriendrequestEntity } from "./api/friends/friend.entity";

/*
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      entities: [User, FriendrequestEntity],
      //logger: 'file',
      // logging: true,
      synchronize: true, // never use TRUE in productio
    }),
*/

export const ds = new DataSource(
	{
		type: 'postgres',
		host: process.env.POSTGRES_HOST,
		username: process.env.POSTGRES_USER,
		database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASS,
        entities: [User, FriendrequestEntity],
		//entities: [Weather, City],
		logging: true,
        synchronize: true,
	}
);

export { User };

/*
$ node
> const { ds, User } = require('./dist/utils.js');
> ds.connect();
> resp = await ds.createQueryBuilder().select().from(User).execute();
> // or
> result = ds.getRepository(User).find({name: 'username'})
> user = result[0]
> // .. update user
> ds.getRepository(User).save()
*/
