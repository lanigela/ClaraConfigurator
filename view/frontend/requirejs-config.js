var config = {
    paths: {
        "claraplayer":  "https://clara.io/js/claraplayer.min"
    },
    shim: {
        "claraplayer": {
            exports: "claraplayer"
        }
    },
    map: {
        '*': {
            clara_player:               'Exocortex_ClaraConfigurator/js/clara-player',
            clara_configurator:         'Exocortex_ClaraConfigurator/js/clara-configurator'
        }
    }
};
