import React, { useContext, useEffect, useState } from "react";
import { MusicBeeAPIContext, Playlist, Track } from "./MusicBeeAPI";
import { useObjectReducer } from "./Utils";

export interface NowPlayingTrack {
    album: string;
    artist: string;
    path: string;
    title: string;
    year: string;
}

export interface NowPlayingCover {
    status: number;
    cover: string;
}


export interface PlayerStatus {
    playerMute: boolean;
    playerRepeat: string;
    playerShuffle: string;
    playerState: "playing" | "paused" | "stopped" | "";
    playerVolume: string;
}

export interface APIPlayerStatus {
    playermute: boolean;
    playerrepeat: string;
    playershuffle: string;
    playerstate: "playing" | "paused" | "stopped" | "";
    playervolume: string;
}

export interface MusicBeeInfo {
    nowPlayingTrack: NowPlayingTrack | null;
    nowPlayingCover: NowPlayingCover | null;
    trackTime: { current: number; total: number } | null;
    playerStatus: PlayerStatus;
    allTracks: Track[];
    playlists: Playlist[];
}

const defaultContext: MusicBeeInfo = {
    nowPlayingTrack: null,
    nowPlayingCover: null,
    trackTime: null,
    playerStatus: {
        playerMute: false,
        playerRepeat: "",
        playerShuffle: "off",
        playerState: "",
        playerVolume: "",
    },
    allTracks: [],
    playlists: [],
};

export const MusicBeeInfoContext = React.createContext<MusicBeeInfo>(defaultContext);

export const MusicBeeInfoProvider: React.FC<{}> = props => {
    const [nowPlayingTrack, setNowPlayingTrack] = useState<NowPlayingTrack | null>(null);
    const [nowPlayingCover, setCover] = useState<NowPlayingCover | null>(null);
    const [playerStatus, setPlayerStatus] = useObjectReducer(defaultContext.playerStatus);
    const [trackTime, setTrackTime] = useObjectReducer({ current: 0, total: 0 });
    const [playlists, setPlaylists] = useState<Playlist[]>([]);


    // "browsetracks" data is relatively big, so it should be kept on API level
    const [allTracks, setAllTracks] = useState<Track[]>([]);

    const API = useContext(MusicBeeAPIContext);

    function setPlayerStatusFromApiData(data: APIPlayerStatus) {
        const { playerstate, playerrepeat, playershuffle, playermute, playervolume } = data;
        setPlayerStatus({
            playerState: playerstate,
            playerMute: playermute,
            playerRepeat: playerrepeat,
            playerShuffle: playershuffle,
            playerVolume: playervolume,
        });
    }

    // prettier-ignore
    useEffect(function initialize() {
        API.sendMessage("init", "");
        API.sendMessage("playerstatus", "");
        API.sendMessage("nowplayingposition", true);
        API.sendMessage("nowplayingcover", true);

        // Browse tracks then set the result
        API.browseTracksAsync().then(setAllTracks);
        API.browsePlaylistsAsync().then(setPlaylists);
    }, [API]);

    // prettier-ignore
    useEffect(function wireUpCallbacks() {
        const playerStateCallback = (playerState: MusicBeeInfo["playerStatus"]["playerState"]) => setPlayerStatus({ playerState });
        const playerVolumeCallback = (playerVolume: string) => setPlayerStatus({ playerVolume });
        const playerShuffleCallback = (playerShuffle: string) => setPlayerStatus({ playerShuffle });
        const playerRepeatCallback = (playerRepeat: string) => setPlayerStatus({ playerRepeat });

        API.addEventListener("nowplayingcover", setCover);

        API.addEventListener("nowplayingposition", setTrackTime);
        API.addEventListener("nowplayingtrack", setNowPlayingTrack);
        API.addEventListener("playerstate", playerStateCallback);
        API.addEventListener("playervolume", playerVolumeCallback);
        API.addEventListener("playerstatus", setPlayerStatusFromApiData);
        API.addEventListener("playershuffle", playerShuffleCallback);
        API.addEventListener("playerrepeat", playerRepeatCallback);

        setInterval(() => {
            API.sendMessage('nowplayingcover', '');
        }, 2000);

        return () => {
            API.removeEventListener("nowplayingcover", setCover);

            API.removeEventListener("nowplayingposition", setTrackTime);
            API.removeEventListener("nowplayingtrack", setNowPlayingTrack);
            API.removeEventListener("playerstate", playerStateCallback);
            API.removeEventListener("playervolume", playerVolumeCallback);
            API.removeEventListener("playerstatus", setPlayerStatusFromApiData);
            API.removeEventListener("playershuffle", playerShuffleCallback);
            API.removeEventListener("playerrepeat", playerRepeatCallback);
        };
    }, 
    // eslint-disable-next-line
    [API, setTrackTime, setPlayerStatus, setNowPlayingTrack, setAllTracks, setCover]);


    return (
        <MusicBeeInfoContext.Provider value={{ playlists, nowPlayingTrack, nowPlayingCover, trackTime, playerStatus, allTracks }}>
            {props.children}
        </MusicBeeInfoContext.Provider>
    );
};
