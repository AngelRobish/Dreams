const {
  db, modles: {User}
} = require('../db')

async function seed() {
  await db.sync({ force: true })

  console.log('db synced!')

  const users = await Promise.all([
    User.create({
      username: 'Alex',
      password: '123123',
      email: 'alex@gmail.com'
    }),
    User.create({
      username: 'Angel',
      password: '123123',
      email: 'angel@gmail.com'
    }),
    User.create({
      username: 'Padme',
      password: '123123',
      email: 'padme@gmail.com'
    })
  ])
}

async function runSeed() {
  console.log('seeding...')
  try {
    await seed()
  } catch (err) {
    console.log(err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

if (module === require.main) {
  runSeed()
}

module.exports = seed
