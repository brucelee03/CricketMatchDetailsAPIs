const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null // db: database

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBServer()

//GET PLAYERS LIST API 1
app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
  SELECT
    player_id as playerId,
    player_name as playerName
  FROM player_details
  ORDER BY player_id;`
  const playersArray = await db.all(getPlayerQuery)
  response.send(playersArray)
})

//GET PLAYER API 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerData = `
  SELECT
    player_id as playerId,
    player_name as playerName
  FROM player_details
  WHERE player_id = ${playerId};`
  const playerData = await db.get(getPlayerData)
  response.send(playerData)
})

//UPDATE PLAYERS DETAILS API 3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const updatePlayerDetails = `
  UPDATE player_details
  SET
    player_name = '${playerName}'
  WHERE player_id = ${playerId};`
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

//GET MATCH DETAIL API 4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchDetails = `
  SELECT 
    match_id as matchId,
    match,
    year
  FROM match_details
  WHERE match_id = ${matchId};`
  const matchDetails = await db.get(getMatchDetails)
  response.send(matchDetails)
})

//GET PLAYER MATCH DETAILS
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchDetails = `
  SELECT 
    match_id as matchId,
    match,
    year
  FROM match_details NATURAL JOIN player_match_score
  WHERE player_id = ${playerId};`
  const playerMatchDetailsArray = await db.all(getPlayerMatchDetails)
  response.send(playerMatchDetailsArray)
})

//GET MATCHES PLAYED BY PLAYER API 6
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const getMatchesPlayedByPlayer = `
  SELECT 
    player_id as playerId,
    player_name as playerName
  FROM player_details NATURAL JOIN player_match_score
  WHERE match_id = ${matchId};`
  const matchesArrayOfPlayer = await db.all(getMatchesPlayedByPlayer)
  response.send(matchesArrayOfPlayer)
})

//GET MATCHES STATICS OF PLAYER API 7
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchesStatics = `
  SELECT 
    player_match_score.player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
  FROM player_match_score INNER JOIN player_details ON player_details.player_id = player_match_score.player_id
  WHERE player_match_score.player_id = ${playerId}
  GROUP BY player_match_score.player_id;`
  const playerMatchesStatics = await db.all(getPlayerMatchesStatics)
  response.send(playerMatchesStatics)
})
module.exports = app
