/*
---------------------------------------------------------------------------
--
-- basics.sql-
--    Tutorial on the basics (table creation and data manipulation)
--
--
-- src/tutorial/basics.source
--
---------------------------------------------------------------------------

-----------------------------
-- Creating a New Table:
--	A CREATE TABLE is used to create base tables.  PostgreSQL has
--	its own set of built-in types.  (Note that SQL is case-
--	insensitive.)
-----------------------------

CREATE TABLE weather (
	city		varchar(80),
	temp_lo		int,		-- low temperature
	temp_hi		int,		-- high temperature
	prcp		real,		-- precipitation
	date		date
);

CREATE TABLE cities (
	name		varchar(80),
	location	point
);
*/

import "reflect-metadata"

import { Entity, DataSource, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("cities")
export class City extends BaseEntity {
	@PrimaryColumn()
	name: string
	@Column({type: "point"})
	location: object
}

@Entity("weather")
export class Weather extends BaseEntity {
	@PrimaryColumn()
	city: string
	@Column()
	temp_lo: number
	@Column()
	temp_hi: number
	@Column()
	prcp: number
	@Column({type: "date"})
	date: object
}

export const ds = new DataSource(
	{
		type: 'postgres',
		host: '/var/run/postgresql/',
		username: 'ubuntu',
		database: 'mydb',
		entities: [Weather, City]
	}
);

export async function init() {

	await ds.connect();

}

init()
