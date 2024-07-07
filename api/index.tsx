import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import {addUserKey, getStats, userVoted, userValue} from "./vercel_endpoints/requests.js"
import { createSystem } from 'frog/ui'

const { Box } = createSystem()

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'main'
})

app.frame('/', async (c) => {
  const { frameData, buttonValue, status } = c

  let cur_usr_voted : boolean = false
  let usrid : undefined | string = undefined
  
  if (frameData && frameData.fid){
    usrid = frameData!.fid.toString()
    cur_usr_voted = await userVoted(usrid)
  }

  if (buttonValue === "Yes"){
    if (usrid !== undefined){
      addUserKey(usrid, true);
    }
  } else {
    if (usrid !== undefined){
      addUserKey(usrid, false);
    }
  }

  let usrVote = "No";
  if (usrid !== undefined){
    const val = await userValue(usrid!)
    if (val){
      usrVote = "Yes";
    }
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
            ? 'You already voted' + '"' + usrVote +'"'
            : "There will be over a 10,000 Kramer predictions before 7/29 midnight "}
        </div>
      </div>
    ),
    intents: [
      <Button value="Yes" action='/resultScreen'>Yes</Button>,
      <Button value="No" action='/resultScreen'>No</Button>,
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
          Yes: {numYes}  No: {numNo}
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
