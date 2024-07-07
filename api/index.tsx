import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import {addUserKey, getStats, userVoted, getProfile} from "./vercel_endpoints/requests.js"
import { createSystem } from 'frog/ui'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }
const { Box } = createSystem()

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'main'
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// const [userLoggedIn, userid] = getProfile()

app.frame('/', async (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  

  // const cur_usr_voted = userLoggedIn ? await userVoted(userid!.toString()) : false // assume user has logged in
  const cur_usr_voted = true
  if (buttonValue === "Yes"){
    await addUserKey("someuser", true);
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {cur_usr_voted
            ? "You already voted"
            : "There will be over a 10,000 Kramer predictions before 7/29 midnight"}
        </div>
      </div>
    ),
    intents: [
      // <TextInput placeholder="Enter custom fruit..." />,
      <Button value="Yes" action='/resultScreen'>Yes</Button>,
      <Button value="No" action='/resultScreen'>No</Button>,
      // <Button value="bananas">Bananas</Button>,
      // status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})
// some, someuser, user:me

app.frame('/resultScreen', async (c) => {
  const [numYes, numNo] = await getStats()
  // const [numYes, numNo] = [10,1]
  return c.res({
    image: (
      <div   style={{
        alignItems: 'center',
        backgroundSize: '100% 100%',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
      }}>
      <Box grow flexDirection="column" gap="8" alignItems='center'>
      <div
          style={{
            color: 'black',
            display: 'flex',
            fontSize: 80,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          There will be over a 10,000 Kramer predictions before 7/29 midnight
        </div>
      <div
          style={{
            color: 'black',
            fontSize: 80,
            display: 'flex',
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          numYes {numYes} and numNos {numNo}
        </div>
      </Box>
         
      </div>
      
      ),
      intents: [
        <Button.Redirect location="https://google.com">Follow Kramer for updates</Button.Redirect>,
      ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
