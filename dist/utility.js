import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "frog/jsx/jsx-runtime";
import { createSystem } from 'frog/ui';
import { backgroundOpacity } from './constants.js';
const { Image } = createSystem();
export function textComponent(txt) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: textStyle, children: txt }), _jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    height: '100%',
                    opacity: backgroundOpacity,
                }, children: _jsx(Image, { objectFit: "contain", src: "/public/dune.png", width: "100%" }) })] }));
}
export function backgroundImage() {
    return (_jsx("div", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            height: '100%',
            opacity: backgroundOpacity,
        }, children: _jsx(Image, { objectFit: "contain", src: "/public/dune.png", width: "100%" }) }));
}
export const outerComponentStyle = {
    alignItems: 'center',
    backgroundSize: '100% 100%',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    height: '100%',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%'
};
export const pollResultStatsStyle = {
    color: 'white',
    fontSize: 60,
    display: 'flex',
    fontStyle: 'normal',
    letterSpacing: '-0.025em',
    lineHeight: 1.4,
    marginTop: 30,
    position: 'relative',
    justifyContent: 'center',
    opacity: 1,
    borderRadius: 15,
};
export const textStyle = {
    color: 'black',
    display: 'flex',
    fontSize: 60,
    fontStyle: 'bold',
    letterSpacing: '-0.025em',
    lineHeight: 1.4,
    marginTop: 30,
    padding: '0 120px',
    whiteSpace: 'pre-wrap',
};
