import { jsx as _jsx, jsxs as _jsxs } from "frog/jsx/jsx-runtime";
import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import { addUserKey, getStats, userVoted, userValue } from "./vercel_endpoints/requests.js";
import { createSystem } from 'frog/ui';
import { env } from 'node:process';
import { textComponent, backgroundImage, outerComponentStyle, pollResultStatsStyle, textStyle } from './utility';
//manually set vercel config variables
env.KV_REST_API_URL = "https://modest-sawfly-54128.upstash.io";
env.KV_REST_API_TOKEN = "AdNwAAIncDE4NDRhZTg3ZTBiMTE0NTVlOWY0ZTNhNjIzYjU1MWRmOHAxNTQxMjg";
//import built in components
const { Box, Image } = createSystem();
//initialize app and routes
export const app = new Frog({
    assetsPath: '/',
    basePath: '/api',
    title: 'main',
});
//the root route
app.frame('/', async (c) => {
    return c.res({
        image: _jsx(Image, { objectFit: "contain", src: "/public/dune.png", width: "100%" }),
        intents: [
            _jsx(Button, { value: "enterpoll", action: '/pollScreen', children: "Enter Poll" }),
        ],
    });
});
//route rendering after just voting
app.frame('/justvoted', async (c) => {
    const fid = c.frameData?.fid;
    let usrVote = "Yes";
    let usrid = undefined;
    if (fid) {
        usrid = fid.toString();
        const usrvalue = await userValue(usrid);
        if (!usrvalue) {
            usrVote = "No";
        }
    }
    return c.res({
        image: (_jsxs("div", { style: outerComponentStyle, children: [textComponent("You have successfully voted" + usrVote), backgroundImage()] })),
        intents: [
            _jsx(Button, { value: "result", action: '/resultScreen', children: "View Results" }),
        ],
    });
});
//the voting screen
app.frame('/pollScreen', async (c) => {
    const { frameData, buttonValue } = c;
    const fid = frameData;
    let cur_usr_voted = false;
    let usrid = undefined;
    if (fid) {
        usrid = fid.toString();
        cur_usr_voted = await userVoted(usrid);
    }
    if (buttonValue === "Yes") {
        if (usrid !== undefined) {
            await addUserKey(usrid, true);
        }
    }
    else {
        if (usrid !== undefined) {
            await addUserKey(usrid, false);
        }
    }
    let usrVote = "No";
    if (usrid !== undefined) {
        const val = await userValue(usrid);
        if (val) {
            usrVote = "Yes";
        }
    }
    const txtToDisplay = cur_usr_voted ? 'You already voted: ' + '"' + usrVote + '"'
        : "There will be over a 10,000 Kramer predictions before 7/29 midnight ";
    return c.res({
        image: (_jsxs("div", { style: outerComponentStyle, children: [textComponent(txtToDisplay), backgroundImage()] })),
        intents: cur_usr_voted ?
            [_jsx(Button.Redirect, { location: "https://warpcast.com/~/channel/kramer", children: "Follow Kramer for updates" }), _jsx(Button, { value: "ViewPoll", action: '/resultScreen', children: "View Positions" })
            ] :
            [
                _jsx(Button, { value: "Yes", action: '/justvoted', children: "Yes" }),
                _jsx(Button, { value: "No", action: '/justvoted', children: "No" }),
            ],
    });
});
// result display screen
app.frame('/resultScreen', async (c) => {
    const [numYes, numNo] = await getStats();
    const totalVotes = numYes + numNo;
    const yesPercentage = (numYes / totalVotes) * 200 > 0 ? (numYes / totalVotes) * 200 : 500;
    const noPercentage = (numNo / totalVotes) * 200 > 0 ? (numNo / totalVotes) * 200 : 500;
    return c.res({
        image: (_jsx("div", { style: outerComponentStyle, children: _jsxs(Box, { grow: true, flexDirection: "column", gap: "8", alignItems: "center", alignContent: 'center', alignSelf: 'center', textAlign: 'center', children: [_jsx("div", { style: textStyle, children: "There will be over a 10,000 Kramer predictions before 7/29 midnight" }), _jsxs(Box, { grow: true, flexDirection: 'row', alignItems: 'center', marginTop: '30', children: [_jsx("div", { style: { ...pollResultStatsStyle, width: yesPercentage, background: 'darkgreen' }, children: _jsx(Box, { grow: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', children: numYes }) }), _jsx("div", { style: { ...pollResultStatsStyle, width: noPercentage, background: 'darkred' }, children: _jsx(Box, { grow: true, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', children: numNo }) })] }), backgroundImage()] }) })),
        intents: [
            _jsx(Button.Redirect, { location: "https://warpcast.com/~/channel/kramer", children: "Follow Kramer for updates" }),
        ],
    });
});
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined';
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });
export const GET = handle(app);
export const POST = handle(app);
