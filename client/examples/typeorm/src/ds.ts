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
	@PrimaryColumn({type: "varchar", length: 80})
	name: string
	// https://github.com/typeorm/typeorm/issues/2896
	@Column({
		type: "point",
		transformer: {
			from: p => p,
			to: p => `(${p.x}, ${p.y})`,
		}
	})
	location: object
}

@Entity("weather")
export class Weather extends BaseEntity {
	@PrimaryColumn()
	city: string
	@Column({type: "varchar", length: 80})
	temp_lo: number
	@Column()
	temp_hi: number
	@Column()
	prcp: number
	@Column({type: "date"})
	date: string
}

export const ds = new DataSource(
	{
		type: 'postgres',
		host: '/var/run/postgresql/',
		username: 'ubuntu',
		database: 'mydb',
		entities: [Weather, City],
		logging: true,
	}
);

export async function init() {

	await ds.connect();

}

init()

/*
 * Attempting to follow along the ~/src/tutorial/basics.sql
 * using queryBuilder
 */
export async function* basics_tutorial() {
	// -- Populating a Table with Rows:
	yield await (ds.createQueryBuilder().
		insert().
		into(Weather).
		values([
			{
				city: 'San Francisco',
				temp_lo: 46,
				temp_hi: 50,
				prcp: 0.25,
				date: '1994-11-27'
			},
		]).execute())
	yield await (ds.createQueryBuilder().
		    insert().
		    into(City).
		    values([
			{
				name: 'San Francisco',
				location: {x: -194.0, y: 53.0}
			}
		    ]).execute())
       // -- Querying a Table
       yield await (ds.createQueryBuilder().
		   select().
		   from(Weather, "weather").
		   execute())
       yield await (ds.createQueryBuilder().
		   select(["city", "(temp_hi+temp_lo)/2 AS temp_avg", "date"]).
		   from(Weather, "weather").
		   execute())
       yield await (ds.createQueryBuilder().
		   select().
		   from(Weather, "weather").
		   where("weather.city = :name", {name: 'San Francisco'}).
		   andWhere("weather.prcp > :prcp", {prcp: 0.0}).
		   execute())
	yield await (ds.createQueryBuilder().
		    select().
		    from(Weather, "weather").
		    distinctOn(["weather.city"]).
		    orderBy("weather.city").
		    execute())
	yield await (ds.createQueryBuilder().
		    select().
		    from(Weather, "weather").
		    from(City, "cities").
		    where("weather.city = cities.name").
		    execute())
	yield await (ds.createQueryBuilder().
		    select(["weather.city", "weather.temp_lo", "weather.temp_hi", "weather.prcp", "weather.date", "cities.location"]).
		    from(Weather, "weather").
		    from(City, "cities").
		    where("cities.name = weather.city").
		    execute())
	yield await (ds.createQueryBuilder().
		    select().
		    from(Weather, "weather").
		    innerJoin(City, "cities", "weather.city = cities.name").
		    execute())
	// left outer join ? could not figure out if there is a matching call
	yield await (ds.createQueryBuilder().
		     select(["W1.city", "W1.temp_lo", "W1.temp_hi",
			     "W2.city", "W2.temp_lo", "W2.temp_hi"]).
		     from(Weather, "W1").
		     addFrom(Weather, "W2").
		     where("W1.temp_lo < W2.temp_lo and W1.temp_hi > W2.temp_hi").
		     execute())
	// why does the above query, only set aliases fro W1 ?
	// -- Aggregate Functions
	yield await (ds.createQueryBuilder().
		     select("max(weather.temp_lo)").
		     from(Weather, "weather").
		     execute())
	yield await (ds.createQueryBuilder().
		     select("city").
		     from(Weather, "weather").
		     where((qb) => {
			const subQuery = qb.
				subQuery().
				select("max(temp_lo)").
				from(Weather, "weather").
				getQuery()
			return "temp_lo = " + subQuery
		     }).
		     execute())
	// -- group by
	yield await (ds.createQueryBuilder().
		     select(["city", "max(temp_lo)"]).
		     from(Weather, "weather").
		     groupBy("city").
		     execute())
	yield await (ds.createQueryBuilder().
		     select(["city", "max(temp_lo)"]).
		     from(Weather, "weather").
		     groupBy("city").
		     having("max(temp_lo) < 40").
		     execute())
	// -- update
	yield await (ds.createQueryBuilder().
		     update(Weather).
		     set({temp_hi: () => "temp_hi - 2", temp_lo: () => "temp_lo - 2"}).
		     where("date > :date", {date: '1994-11-28'}).
		     execute())
	// -- delete
	yield await (ds.createQueryBuilder().
		     delete().
		     from(Weather, "weather").
		     where("city = :city", {city: 'Hayward'}).
		     execute())
	yield await (ds.createQueryBuilder().
		     delete().
		     from(Weather).
		     execute())
}
