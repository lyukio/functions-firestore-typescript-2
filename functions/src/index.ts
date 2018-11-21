import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()
const db = admin.firestore()
db.settings({timestampsInSnapshots: true})

export const getGame = functions.https.onRequest(async (request, response) => {
    try {
        const gameSnapshot = await db.doc('games/game1').get()
        response.send(gameSnapshot.data())
    } catch (error) {
        console.error(error)
        response.status(500).send("deu erro no back")
    }
})

export const getVitaoGames = functions.https.onRequest(async (request, response) => {
    try {
        const playerSnapshot = await db.doc('players/player1').get()
        const gamesPromises = []
        const vitaoGames = playerSnapshot.data().games
    
        for (const gameId in vitaoGames) {
            const gamePromise = db.doc(`games/${gameId}`).get()
            gamesPromises.push(gamePromise)
        }
        const gamesSnapshot = await Promise.all(gamesPromises)
        const gamesData = []
        gamesSnapshot.forEach(gameSnapshot => {
            const gameData = gameSnapshot.data()
            gameData.gameId = gameSnapshot.id
            gamesData.push(gameData)
        });
        response.send(gamesData)
        
    } catch (error) {
        console.error(error)
        response.status(500).send("deu erro no back")
    }
})

export const onVitaoUpdate = functions.firestore.document('players/player1').onUpdate(change => {
    const dataChanged = change.after.data()
    const payload = {
        data: {
            name: dataChanged.name,
            // games: String(dataChanged.games)
        }
    }
    return admin.messaging().sendToTopic("data", payload)
})