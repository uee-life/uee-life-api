from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
import json
import requests
from config import config

class App:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()
    
    def create_system(self, system_name):
        with self.driver.session(database="neo4j") as session:
            # Write transactions allow the driver to handle retries and transient errors
            result = session.execute_write(
                self._create_system, system_name)
            for row in result:
                print("Created system: {sys}".format(sys=row['s']))

    def create_celestial_body(self, body, parent):
        func = None
        rsi_id = body['id']
        if body['subtype']['id'] == "52":
            print("Attaching moon to: ", parent)
            func = self._create_and_link_moon
        else:
            print("Attaching planet to: ", parent)
            func = self._create_and_link_planet
            

        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                func, body, rsi_id, parent
            )
            for row in result:
                print("Created body: {n}".format(n=row['body']))
    
    def create_jump(self, src, dest, size):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_jump, src, dest, size
            )
            for row in result:
                print("Created jump: {a} to {b}".format(a=row['s1'], b=row['s2']))

    @staticmethod
    def _create_system(tx, system_name):
        query = (
            "MERGE (s:System { name: $system_name }) "
            "RETURN s"
        )
        result = tx.run(query, system_name=system_name)
        try:
            return [{"s": row["s"]["name"]}
                for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise

    @staticmethod
    def _create_and_link_planet(tx, data, rsi_id, system_name):
        print(data)
        query = (
            "MATCH (system:System { name: $system_name }) "
            "MERGE (planet:Planet { rsi_id: $id, name: $planet_name, type: $planet_type}) "
            "MERGE (planet)-[:ORBITS]->(system) "
            "RETURN planet"
        )
        result = tx.run(query, id=rsi_id, system_name=system_name, planet_name=data['name'], planet_type=data['type'])
        try:
            return [{"body": row["planet"]["name"]}
                for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise

    @staticmethod
    def _create_and_link_moon(tx, data, rsi_id, parent):
        query = (
            "MATCH (planet:Planet { rsi_id: $parent }) "
            "MERGE (moon:Moon { rsi_id: $id, name: $moon_name, type: $moon_type}) "
            "MERGE (moon)-[:ORBITS]->(planet) "
            "RETURN moon"
        )
        result = tx.run(query, id=rsi_id, parent=parent, moon_name=data['name'], moon_type=data['type'])
        try:
            return [{"body": row["moon"]["name"]}
                for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise

    @staticmethod
    def _create_jump(tx, source, destination, size):
        query = (
            "MATCH (s1:System { name: $source }) "
            "MATCH (s2:System { name: $destination }) "
            "MERGE (s1)-[:JUMP_POINT { size: $size }]->(s2) "
            "MERGE (s2)-[:JUMP_POINT { size: $size }]->(s1) "
            "RETURN s1,s2"
        )
        result = tx.run(query, source=source, destination=destination, size=size)
        try:
            return [{"s1": row["s1"]["name"], "s2": row["s2"]["name"]}
                for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise

'''
https://robertsspaceindustries.com/api/starmap/bootup
data.species
data.systems.rowcount
data.systems.resultset[]
    .code
    .name
    .type
    .id
    .description
https://robertsspaceindustries.com/api/starmap/bookmarks/find
https://robertsspaceindustries.com/api/starmap/celestial-objects/SOL
data.resultset[].celestial_objects[]
    .type (PLANET)
    .affiliation.name
    .code
    .descirption
    .designation
    .habitable
    .id
    .name
    .subtype.name
    .sensor_danger
    .sensor_economy
    .sensor_population
    .thumbnail.source
Moon:
data.resultset[].celestial_objects[]
    .type (SATELLITE)
    .affiliation (empty, match parent?)
    .code
    .description
    .designation
    .habitable
    .id
    .name
    .subtype.name
    .sensor_danger
    .sensor_economy
    .sensor_population
LZs:
data.resultset[].celestial_objects[]
    .type (LZ)
    .affiliation (empty, match parent?)
    .code
    .description
    .designation
    .habitable
    .id
    .name (if empty, match designation?)
    .sensor_danger
    .sensor_economy
    .sensor_population
https://robertsspaceindustries.com/api/starmap/celestial-objects/SOL.PLANETS.EARTH
.data.resultset[].children[]
    .type (LZ, SATELLITE)
    .code
    .description
    .designation
    .id
to load starmap: https://robertsspaceindustries.com/starmap?location=ELLIS.PLANETS.ELLISI&system=ELLIS
'''

replaces = [
    (u"\u2019", "'"),
    (u"\u0101", "a"),
    (u"\u016b", "u"),
    (u"\u0113", "e")
]

def getSystems():
    url = "https://robertsspaceindustries.com/api/starmap/bootup"
    systems = {}
    #try:
    res = requests.post(url,"")
    data = json.loads(res.text)["data"]

    for system in data['systems']['resultset']:

        try:
            affiliation = int(system['affiliation'][0]['id'])
        except:
            affiliation = 0

        try:
            name = system['name']
            for rep in replaces:
                name = name.replace(rep[0], rep[1])
        except:
            name = system['name'].decode('ascii', 'ignore')

        try:
            description = system['description']
            for rep in replaces:
                description = description.replace(rep[0], rep[1])
        except:
            description = ""

        sysdata = (
            system['code'],
            name,
            affiliation,
            description,
            system['type'],
            system['id']
        )

        systems[system['code']] = sysdata
    logging.debug("Systems Added: " + ", ".join(systems.keys()))

    jumps = []

    for jp in data['tunnels']['resultset']:
        path = jp['entry']['code'].split('.')
        jumps.append({
            "from":path[0],
            "to":path[2],
            "size":jp["size"]
            })

    #except:
    #    logging.error("Failed to load systems")
    return (systems, jumps)

def getPlanets(system, sys_id):
    url = "https://robertsspaceindustries.com/api/starmap/star-systems/" + system
    try:
        res = requests.post(url, "")
        data = json.loads(res.text)["data"]["resultset"][0]
        affiliation = data['affiliation'][0]['name']
        data = data['celestial_objects']
    except Exception as e:
        logging.error("Failed loading URL: " + e)
        data = []
        affiliation = 0
        return
    planets = {}
    moons = {}
    for obj in data:
        if obj['type'] == "PLANET" or obj['type'] == "SATELLITE":
            planet = obj
            if planet['affiliation']:
                local_affiliation = planet['affiliation'][0]['name']
            else:
                local_affiliation = affiliation
            if planet['habitable']:
                planet['habitable'] = 1
            else:
                planet['habitable'] = 0
            if 'thumbnail' in planet.keys():
                planet['thumbnail'] = planet['thumbnail']['source']
            else:
                planet['thumbnail'] = ""
            try:
                planet['danger'] = int(planet['sensor_danger'])
                planet['economy'] = int(planet['sensor_economy'])
                planet['population'] = int(planet['sensor_population'])
            except:
                print("Failed conversion...")
                planet['danger'] = planet['economy'] = planet['population'] = 0

            if not planet['parent_id']:
                planet['parent_id'] = sys_id

            try:
                planet['id'] = int(planet['id'])
                planet['parent_id'] = int(planet['parent_id'])
            except:
                print("couldn't convert ids")

            if not planet['name']:
                planet['name'] = planet['designation']

            name = planet['name']
            for rep in replaces:
                name = name.replace(rep[0], rep[1])

            if planet['description']:
                description = planet['description']
                for rep in replaces:
                    description = description.replace(rep[0], rep[1])
            else:
                description = ""

            designation = planet['designation']
            for rep in replaces:
                designation = designation.replace(rep[0], rep[1])

            planetData = {
                "code": planet['code'],
                "name": name,
                "description": description,
                "type": planet['type'],
                "subtype": planet['subtype'],
                "designation": designation,
                "habitable": planet['habitable'],
                "danger": planet['danger'],
                "economy": planet['economy'],
                "population": planet['population'],
                "thumbnail": planet['thumbnail'],
                "affiliation": local_affiliation,
                "system": system,
                "id": planet['id'],
                "parent_id": planet['parent_id'],
            }
            if obj['subtype_id'] == "52":
                logging.debug('moon found: ', planetData['name'])
                moons[planet['id']] = planetData
            else:
                planets[planet['id']] = planetData
            #c.execute(sql, planetData)
    return (planets, moons)

def getCities(planet, parent_afill):
    url = "https://robertsspaceindustries.com/api/starmap/celestial-objects/" + planet
    print(url)
    try:
        res = requests.post(url, "")
        data = json.loads(res.text)["data"]["resultset"][0]
        if data['affiliation']:
            affiliation = data['affiliation'][0]['name']
        else:
            affiliation = parent_afill
        data = data['children']
    except ConnectionError as e:
        print("Failed loading URL")
        print(e.reason)
        data = []
    cities = {}
    for obj in data:
        # TODO: Add in check for moons and such...
        if obj['type'] == "LZ" or obj['type'] == 'MANMADE':
            city = obj

            if city['affiliation']: 
                local_affiliation = city['affiliation'][0]['name']
            else:
                local_affiliation = affiliation

            if city['habitable']:
                city['habitable'] = 1
            else:
                city['habitable'] = 0
            try:
                city['danger'] = int(city['sensor_danger'])
                city['economy'] = int(city['sensor_economy'])
                city['population'] = int(city['sensor_population'])
            except:
                print("Failed conversion...")
                city['danger'] = city['economy'] = city['population'] = 0

            if 'thumbnail' in city.keys():
                city['thumbnail'] = city['thumbnail']['source']
            else:
                city['thumbnail'] = ""

            if city['subtype']:
                city['subtype'] = city['subtype']['name']
            else:
                city['subtype'] = ""

            designation = city['designation']
            for rep in replaces:
                designation = designation.replace(rep[0], rep[1])

            if city['description']:
                description = city['description']
                for rep in replaces:
                    description = description.replace(rep[0], rep[1])
            else:
                description = ""

            try:
                city['id'] = int(city['id'])
                city['parent_id'] = int(city['parent_id'])
            except:
                print("couldn't convert ids")

            cityData = (
                city['code'], # code
                designation,
                city['type'],
                city['subtype'],
                description,
                city['habitable'],
                city['danger'], # danger
                city['economy'],# economy
                city['population'],# population
                city['thumbnail'], # thumbnail
                local_affiliation,
                planet,
                city['id'],
                city['parent_id']
            )

            cities[city['code']] = cityData
    logging.debug("Cities added: " + ", ".join(cities.keys()))
    return cities

def updateDatastore():
    #db = MySQLdb.connect(host=config.dbhost,user=config.dbuser,passwd=config.dbpass,db=config.dbname, use_unicode=True, charset="utf8")
    uri = config['uri']
    user = config['user']
    password = config['password']
    app = App(uri, user, password)

    (systems, jumps) = getSystems()
    planets = {}
    cities = {}
    db = None
    for system in systems.keys():
        app.create_system(system)
        #storeSystem(systems[system], db)
        (newPlanets,newMoons) = getPlanets(system, systems[system][5])
        for p in newPlanets:
            planet = newPlanets[p]
            print("Planet: ", planet)
            app.create_celestial_body(planet, system)
            '''storePlanet(newPlanets[planet], db)
            newCities = getCities(planet, newPlanets[planet][11])
            for city in newCities.keys():
                storeCity(newCities[city], db)
            cities.update(newCities)
        planets.update(newPlanets)'''
        for m in newMoons:
            moon = newMoons[m]
            print("Moon: ", moon['name'])
            app.create_celestial_body(moon, moon['parent_id'])
    for jump in jumps:
        app.create_jump(jump["from"], jump["to"], jump["size"])

    result = {
        'success': 1,
        'systems': len(systems),
        'planets': len(planets),
        'cities': len(cities)
    }
    #db.close()
    logging.info("Total Systems: " + str(len(systems.keys())))
    logging.info("Total Planets: " + str(len(planets.keys())))
    logging.info("Total Cities: " + str(len(cities.keys())))

    app.close()
    return result

print(updateDatastore())