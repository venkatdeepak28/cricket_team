const express = require('express')
const app = express()

const path = require('path')

app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let dbObj = null

let iniatilizeDbandServer = async () => {
  try {
    dbObj = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started Successfully')
    })
  } catch (e) {
    console.log(`Unstable Connectivity ${e.message}`)
    process.exit(1)
  }
}

module.exports = app

iniatilizeDbandServer()

const convertDbObject = objectItem => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  }
}

//API1 GET

app.get('/players/', async (request, response) => {
  const getQueryValue = `select * from cricket_team`
  const dbValue = await dbObj.all(getQueryValue)
  response.send(dbValue.map(eachPlayer => convertDbObject(eachPlayer)))
})

//API2 POST

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  console.log(playerName)
  const postQueryValue = `INSERT INTO
  cricket_team(player_name,jersey_number,role)
  VALUES
  ("${playerName}", ${jerseyNumber}, "${role}")`
  const postQueryrun = await dbObj.run(postQueryValue)
  response.send('Player Added to Team')
})

//API3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerbyIdquery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
  const selectedValue = await dbObj.all(getPlayerbyIdquery)
  response.send(convertDbObject(selectedValue[0]))
})

//API4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const putQueryValue = `UPDATE cricket_team 
  SET player_name = "${playerName}",jersey_number = ${jerseyNumber},role = "${role}" 
  WHERE player_id = ${playerId};`
  await dbObj.run(putQueryValue)
  response.send('Player Details Updated')
})

//API5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQueryValue = `DELETE FROM 
  cricket_team 
  WHERE 
  player_id = ${playerId};`
  await dbObj.run(deleteQueryValue)
  response.send('Player Removed')
})
