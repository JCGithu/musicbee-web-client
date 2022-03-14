import { makeStyles, Slider } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { MusicBeeInfoContext } from "../Logic/MusicBeeInfo";
import { MusicBeeAPIContext } from "../Logic/MusicBeeAPI";
import { millisecondsToTime, useObjectReducer } from "../Logic/Utils";

const backupImage = 'https://i0.wp.com/www.godisinthetvzine.co.uk/wp-content/uploads/2020/06/IMG_20200602_120716_501.jpg?fit=1080%2C1080&ssl=1'

const useStyles = makeStyles(theme => ({
    bar: {
        width: "470px",
        height: "320px",
        padding: "0.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        color: "#232323"
    },
    seek: {
        margin: "0px 10px",
        color: theme.palette.primary.main,
    },
    volumeSlider: {
        width: 200,
        marginRight: 10,
        marginLeft: 10,
        color: theme.palette.primary.main,
    },
    seekContainer: {
        display: "flex",
        alignItems: "center",
        width: 410,
        position: 'absolute',
        left: 30,
        top: 275,
        justifyContent: "start",
    },
    metadata: {
        display: "flex",
        flexDirection: "column",
        fontSize: 19,
        top: 45,
        left: 235,
        width: `230px !important`,
        position: "absolute",
    },
}));

const PlayerControls: React.FC<{}> = () => {
    const classes = useStyles();

    const API = useContext(MusicBeeAPIContext);
    const {
        nowPlayingTrack,
        nowPlayingCover,
        playerStatus: { playerState },
        trackTime: serverTrackTime,
    } = useContext(MusicBeeInfoContext);

    const [localTrackTime, setLocalTrackTime] = useObjectReducer({ current: 0, total: 0 });

    // Synchronize the local track time/volume whenever the host sends new info
    // (This is so the user can seek smoothly without sending new API calls every millisecond)
    useEffect(() => setLocalTrackTime({ ...serverTrackTime }), [serverTrackTime, setLocalTrackTime]);

    // Advance the seek bar every second
    useEffect(() => {
        // Set the track time to change every second
        // (approximately - this gets reset every once in a while when the server synchronizes the time)
        const interval = setInterval(() => {
            if (playerState === "playing") {
                //if (nowPlayingCover) console.log(nowPlayingCover);
                setLocalTrackTime(prev => ({ current: Math.min(prev.current + 1000, prev.total) }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [setLocalTrackTime, playerState]);

    return (
        <div className={classes.bar}>
            <div id='album'>
                {nowPlayingCover ? <img alt='cover' src={nowPlayingCover.cover ? `data:image/jpeg;base64,${nowPlayingCover.cover}` : backupImage}></img>: 'no art'}
            </div>
            <div className={classes.metadata}>
                {nowPlayingTrack ? (
                    <>
                        <h1>{nowPlayingTrack.title}</h1>
                        <span>{nowPlayingTrack.artist}</span>
                        <span>{nowPlayingTrack.album}</span>
                        <span className="small">{nowPlayingTrack.year ? `\n ${nowPlayingTrack.year}` : ""}</span>
                    </>
                ) : (
                    "(not playing)"
                )}
            </div>
            <div className={classes.seekContainer}>
                <h2>{millisecondsToTime(localTrackTime.current)}</h2>
                <Slider
                    onChange={(_, value) => setLocalTrackTime({ current: value as number })}
                    onChangeCommitted={(_, value) => API.seek(value as number)}
                    className={classes.seek}
                    value={localTrackTime.current}
                    max={localTrackTime.total}
                />
                <h2>{millisecondsToTime(localTrackTime.total)}</h2>
            </div>
            <p id='playingData'>{nowPlayingTrack && JSON.stringify(nowPlayingTrack)}</p>
        </div>
    );
};

export default PlayerControls;
