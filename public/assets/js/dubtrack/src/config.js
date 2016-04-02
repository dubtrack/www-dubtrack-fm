SOUNDMANAGER = WINDOW[Δ`SOUND^MANAGER`]
BACKBONE = WINDOW[Δ`^BACKBONE`]
CAPSIFY(BACKBONE)

DUBTRACK_LANG = WINDOW[Δ`DUBTRACK_LANG`]
OBJECT.KEYS(DUBTRACK_LANG).FOREACH( K => CAPSIFY(DUBTRACK_LANG[K], TRUE))
CAPSIFY(DUBTRACK_LANG, TRUE)

/**
 *  DUBTRACK MAIN
 *
 */

DT = WINDOW[Δ`DT`] = LC_OBJ({
    "CHAT": {},
    "PLAYER": {},
    "ROOM": {},
    "PROFILE": {},
    "PLAYLIST": LC_OBJ({
        "CONTAINER^EL^CREATE^APP": FALSE
    }),
    "GLOBAL": {},
    "HELP": {},
    "HELPERS": {},
    "BINDED^DOCUMENT": FALSE,
    "USERS": {},
    "USER": {}
})

DUBTRACKMAIN = WINDOW[Δ`DUBTRACK^MAIN`] = LC_OBJ({
    "CONFIG": {}
})

!WINDOW.DUBTRACK_API_URL && (
    WINDOW.DUBTRACK_API_URL = Δ`HTTPS://API.DUBTRACK.FM`
)

WINDOW[Δ`^DUBTRACK`] = DUBTRACK = LC_OBJ({
    INIT: _HIDE_IMAGES => {
        // LOAD DEFAULT GLOBAL VALUES
        _HIDE_IMAGES = DUBTRACK.HELPERS.COOKIE.GET(Δ`DUBTRACK-HIDE-IMAGES`)
        ;(_HIDE_IMAGES && _HIDE_IMAGES == Δ`HIDE`) && (
            DUBTRACK[Δ`^HIDE^IMAGES`] = TRUE
        )
        SOUNDMANAGER["WAIT^FOR^WINDOW^LOAD"] = TRUE

        DUBTRACK.HELPERS.LOADDEPENDENCIES(_ => {
            DUBTRACK.APP = DUBTRACK[Δ`APP`] = NEW(WINDOW[Δ`^DUBTRACK^ROUTE`])

            BACKBONE[Δ`HISTORY`][Δ`START`](LC_OBJ({
                "PUSHSTATE": TRUE
            }))
        })
    },

    //PLACEHOLDERS
    CHAT: {},

    PLAYER: {},

    ROOM: {},

    "ROOM^LIST": {},

    LAYOUT: {},

    USERS: {},

    USER: {},

    SESSION: {},

    VIEWS: {},

    //BACKBONE PLACEHOLDERS
    "^MODEL": {},

    "^COLLECTION": {},

    "^VIEW": {},

    "^HIDE^IMAGES": FALSE,

    $: LC_OBJ({
        BODY: $('BODY'),
        "MAIN^SECTION^EL": $(Δ`SECTION#MAIN-SECTION`)
    }),

    CONFIG: $.EXTEND(
        LC_OBJ({
            "API^URL": WINDOW.DUBTRACK_API_URL,

            URLS: LC_STRING_MAP({
                "MEDIA^BASE^URL": "HTTPS://DUBTRACK-FM.S3.AMAZONAWS.COM",
                "COMMENTS^DUBS": "/COMMENTS/:ID/DUBS",
                "COMMENTS^FLAG": "/COMMENTS/:ID/FLAG",
                "ROOM": "/ROOM",
                "ROOM^SEARCH": "/ROOM/TERM/:TERM",
                "ROOM^IMAGE": "/ROOM/:ID/IMAGE",
                "ROOM^USERS": "/ROOM/{ID}/USERS",
                "ROOM^BAN^USERS": "/ROOM/:ID/USERS/BAN",
                "ROOM^MUTE^USERS": "/ROOM/:ID/USERS/MUTE",
                "ROOM^BEACON": "/ROOM/BEACON/:ID/:USERID",
                "ROOM^QUEUE": "/ROOM/{ID}/PLAYLIST",
                "ROOM^QUEUE^DETAILS": "/ROOM/:ID/PLAYLIST/DETAILS",
                "ROOM^HISTORY": "/ROOM/:ID/PLAYLIST/HISTORY",
                "ROOM^LOCK^QUEUE": "/ROOM/:ID/LOCK^QUEUE",
                "USER^QUEUE^PAUSE": "/ROOM/:ID/QUEUE/PAUSE",
                "DUBS": "/DUBS",
                "USER": "/AUTH/SESSION",
                "UPDATE^USERNAME": "/USER/UPDATE^USERNAME",
                "QUERY^USERNAME^AVAILABILITY": "/USER/QUERY/AVAILABILTY",
                "SESSION": "/AUTH/SESSION",
                "PLAYLIST": "/PLAYLIST",
                "PLAYLIST^UPDATE": "/PLAYLIST/:ID",
                "PLAYLIST^ORDER": "/PLAYLIST/:ID/ORDER",
                "PLAYLIST^SONG": "/PLAYLIST/:ID/SONGS",
                "GET^SOUND^CLOUD^PLAYLISTS": "/PLAYLIST/SOUNDCLOUD",
                "IMPORT^YOUTUBE^PLAYLIST": "/PLAYLIST/IMPORT/YOUTUBE",
                "IMPORT^SOUNDCLOUD^PLAYLIST": "/PLAYLIST/IMPORT/SOUNDCLOUD",
                "SONG": "/SONG",
                "SONG^COMMENTS": "/SONG/:ID/COMMENTS",
                "CHAT": "/CHAT/:ID",
                "DELETE^CHAT": "/CHAT/:ID/:CHATID",
                "ROOM^PLAYLIST": "/ROOM/:ID/PLAYLIST",
                "ROOM^PLAYLIST^ACTIVE": "/ROOM/:ID/PLAYLIST/ACTIVE",
                "DUBS^PLAYLIST^ACTIVE": "/ROOM/:ID/PLAYLIST/ACTIVE/DUBS",
                "KICK^USER": "/CHAT/KICK/:ROOMID/USER/:ID",
                "BAN^USER": "/CHAT/BAN/:ROOMID/USER/:ID",
                "MUTE^USER": "/CHAT/MUTE/:ROOMID/USER/:ID",
                "SET^MOD^USER": "/CHAT/52D1CE33C38A06510C000001/:ROOMID/USER/:ID",
                "SET^D^J^USER": "/CHAT/5615FEB8E596154FC2000002/:ROOMID/USER/:ID",
                "SET^MANAGER^USER": "/CHAT/5615FD84E596150061000003/:ROOMID/USER/:ID",
                "SET^V^I^P^USER": "/CHAT/5615FE1EE596154FC2000001/:ROOMID/USER/:ID",
                "SET^OWNER^USER": "/CHAT/5615FA9AE596154A5C000000/:ROOMID/USER/:ID",
                "SET^ROOM^D^J^USER": "/CHAT/564435423F6BA174D2000001/:ROOMID/USER/:ID",
                "SKIP^SONG": "/CHAT/SKIP/:ID/:SONGID",
                "USER^QUEUE": "/USER/SESSION/ROOM/:ID/QUEUE",
                "USER^QUEUE^ORDER": "/USER/SESSION/ROOM/:ID/QUEUE/ORDER",
                "ROOM^USER^QUEUE^ORDER": "/ROOM/:ID/QUEUE/ORDER",
                "USER^FOLLOW": "/USER/:ID/FOLLOWS",
                "USER^FOLLOWING": "/USER/:ID/FOLLOWING",
                "USER^IMAGE": "/USER/:ID/IMAGE",
                "SEARCH": "/SEARCH",
                "MESSAGES": "/MESSAGE",
                "MESSAGES_ITEMS": "/MESSAGE/:ID",
                "MESSAGES_NEWS": "/MESSAGE/NEW",
                MESSAGES_READ: "/MESSAGE/:ID/READ"
            }),

            KEYS: LC_STRING_MAP({
                PUBUNUB: 'SUB-C-2B40F72A-6B59-11E3-AB46-02EE2DDAB7FE',
                SOUNDCLOUD: '801FACF61770A4CBF5566EB15B59E7A0',
            }),

            PLAYER: LC_OBJ({
                YOUTUBE: LC_OBJ({
                    "YOUTUBE^VARS": LC_OBJ({
                        'CONTROLS': 0,
                        'REL': 0,
                        'SHOWINFO': 0,
                        'AUTOPLAY': 1,
                        'OUTPUT': Δ`EMBED`,
                        'WMODE': Δ`TRANSPARENT`,
                        'PLAYSINLINE': 1,
                        'IV_LOAD_POLICY': 3,
                        'HTML5': 1,
                        'IS_HTML5_MOBILE_DEVICE': 1,
                        'DISABLEKB': 1,
                        'FRAMEBORDER': 0
                    }),

                    "PLAYER^PARAMS": LC_OBJ({
                        'CONTROLS': 0,
                        'REL': 0,
                        'SHOWINFO': 0,
                        'AUTOPLAY': 0,
                        'MODESTBRANDING': 1,
                        'OUTPUT': Δ`EMBED`,
                        'WMODE': Δ`TRANSPARENT`,
                        'PLAYSINLINE': 1,
                        'IV_LOAD_POLICY': 3,
                        'HTML5': 1,
                        'IS_HTML5_MOBILE_DEVICE': 1,
                        'DISABLEKB': 1,
                        'FRAMEBORDER': 0
                    })
                }),

                "PLAYER^WIDTH": '100%',
                "PLAYER^HEIGHT": '100%',

                "PLAYER^EMBED^WIDTH": '100%',
                "PLAYER^EMBED^HEIGHT": 360
            }),
            "MAIN^ROOM^CONTAINER": $(Δ`#MAIN_ROOM`),
            "PLAYER^MAIN^CONTAINER": $(Δ`#MAIN_PLAYER`),
            "PLAYER^CONTAINER": $(Δ`#MAIN_PLAYER DIV.PLAYER_CONTAINER`),
            "PLAYER^CONROLS": $(Δ`#ROOM_INFO`),
            "GA^ID": 'UA-31613628-1',
            "CHAT^CONTAINER": $(Δ`DIV#CHAT`),
            "MAIN^SECTION^EL": $(Δ`SECTION#MAIN-SECTION`),
            "AVATAR^CONT^EL": $(Δ`DIV#AVATAR^CONT`)
        }),
        LC_STRING_MAP({

            "ROOM^LIST^CONTAINER": 'ROOM^LIST^CONTAINER', //ID ONLY DIV WILL BE CREATED BY APP
            "DUBS^LIST^CONTAINER": 'DUBS^LIST^CONTAINER', //ID ONLY DIV WILL BE CREATED BY APP

            "LOADING^ELS": '<DIV CLASS="SPINNER"><DIV CLASS="BOUNCE1"></DIV><DIV CLASS="BOUNCE2"></DIV><DIV CLASS="BOUNCE3"></DIV></DIV>',

            "URL^P^LAYER^PLAYLIST": "/ROOM/PLAYLIST/GET/IDROOM/",
            "URL^ROOM^INFO": "/API/ROOMS/LOAD_ROOM_INFO/IDROOM/",
            "CHAT^END^POINT^URL": "/ROOM/CHAT/SEND/IDROOM/",
            "PLAYER^VOTE^URL": "/ROOM/MAIN/VOTE/IDROOM/",
            "BROWSER^PLAYLIST^DEATILS^URL": "/API/PLAYLIST/GET^PLAYLIST/ID/",
            "ROOM^JOIN": "/ROOM/MAIN/JOIN/IDROOM/",
            "ROOM^JOIN^INCO": "/API/ROOMS/JOIN^INCOGNITO/IDROOM/",
            "ROOM^LEAVE": "/ROOM/MAIN/REMOVE^USER",
            "ROOM^LIST^URL": "/API/ROOMS/GET_ROOMS/IDUSER/0",
            "BROWSER^SEARCH^URL": "/API/YOUTUBE/",
            "DUBS^URL": "/API/DUBS/API",
            "DUBS^GET^SONG": "/API/DUBS/VIEWAPI/URL_SH/",
            "SEARCH^DUBS^URL": "/API/DUBS/API^SEARCH",
            "USER^PROFILE^URL": "/API/USERS/GET_USER_INFO",
            "SAVE^DUB^COMMENT": "/API/DUBS/SAVE_COMMENT/",
            "REPORT^SPAM^COMMENT": "/API/DUBS/SPAM_COMMENT/",
            "DELETE^COMMENT": "/API/DUBS/DELETE_COMMENT/ID/",
            "GET^AVATARS^ROOM": "/API/ROOMS/LOAD^USERS/IDROOM/",
            "GET^ROLES^ROOM": "/API/ROOMS/GET_ROOM_ROLES/IDROOM/",
            "GET^AVATAR^URL": "/API/USERS/GET/DETAILS/1/ID/",
            "GET^WALL^POST": "/API/USERS/GET_WALL_POST/ID/",
            "DUB^WALL^POST": "/API/DUBS/DUB_WALL_COMMENT/",
            "SAVE^WALL": "/USER/SAVE_WALL/",
            "DELETE^WALL": "/USER/DELETE",
            "GET^PLAYLIST^PUBLIC": "/API/PLAYLIST/GET^LIST^PUBLIC",
            "GET^FOLLOWING": "/API/USERS/FOLLOWS/",
            "FETCH^NOTIFICATION": "/API/USERS/NOTIFICATION_FEED/PAGE/",
            "ADD^QUEUE": "/ROOM/PLAYLIST/ADD/IDROOM/",
            "SAVE^USER^ID": "/API/USERS/UPDATEDT",
            CHECKUSERNAME: "/API/USERS/CHECK_USERNAMEDT",
            "ROOM^UPDATE": "/ROOM/MAIN/UPDATE",
            "ROOM^CREATE": "/ROOM/MAIN/CREATE",
            "FOLLOW^URL": "/API/USERS/FOLLOW/",
            "UNFOLLOW^URL": "/API/USERS/UNFOLLOW/",
            "GET^WALL^POSTS^URL": "/API/USERS/GET_WALL_POSTS/ID/",
            "ADD^TO^PLAYLIST": "/API/PLAYLIST/ADD^MEDIA",
            "REMOVE^FROM^PLAYLIST": "/API/PLAYLIST/DELETE^MEDIA",
            "CHANGE^PLAYLIST^TYPE": "/API/PLAYLIST/CHANGE_PLAYLIST_TYPE",
            "QUEUE^PLAYLIST": "/ROOM/PLAYLIST/ADD^PLAYLIST",
            "REMOVE^FROM^QUEUE": "/ROOM/PLAYLIST/DELETE^MEDIA/",
            "ADD^PLAYLIST": "/API/PLAYLIST/ADD",
            "REMOVE^PLAYLIST": "/API/PLAYLIST/DELETE",
            "GET^QUEUE^URL": "/ROOM/PLAYLIST/GET^LIST^USER/",
            "MYTRACKS^URL": "/DUBTRACK/MUSIC/GET",
            "UPDATE^MYTRACKS^URL": "/DUBTRACK/MUSIC/UPDATE",
            "DELETE^MYTRACKS^URL": "/DUBTRACK/MUSIC/DELETE",
            "GET^MUSIC^TRACKS": "/DUBTRACK/MUSIC/GET^MUSIC/USERID/",
            "ROOM^HISTORY": "/ROOM/PLAYLIST/GET^HISTORY/",
            "GET^QUEUE^PLACE": "/ROOM/PLAYLIST/SHOWNEXT/",
            "NOTIFICATIONS^COUNT^URL": "/API/USERS/GET_NOTIFICATION_FEED_COUNT",
            "GET^FRIENDS^ROOM^URL": "/API/ROOMS/GET^ROOM^FRIENDS/IDROOM/",
            "GET^MODS^ROOM^URL": "/API/ROOMS/GET^ROOM^MODS/IDROOM/",
            "GET^FRIENDS^GLOBAL^URL": "/API/USERS/GET_FRIENDS",
            "GET^CHAT^HISTORY": "/API/ROOMS/GET_HISTORY/IDROOM/",
            "SEND^MESSAGE^URL": "/USER/SENDMESSAGE",
            "GET^MESSAGES^URL": "",
            "GLOBAL^BASE^URL": "HTTP://DUBTRACK.FM/"
        })
    ),

    ELS: LC_OBJ({
        "MAIN^LOADING": NULL,

        INIT: (_$ML) => {
            $.EXTEND(DUBTRACK.ELS, LC_OBJ({
                "MAIN^LOADING": _$ML = $(Δ`#MAIN-LOADING`).SHOW(),
                "MAIN^LOADING^TEXT": _$ML.FIND('.LOADING-TEXT')
                    .HTML(DUBTRACK_LANG.GLOBAL.LOADING)
            }))

        },

        "DISPLAYLOADING": (LANGTEXT) => {
            LANGTEXT || (LANGTEXT = DUBTRACK_LANG[Δ`GLOBAL`][Δ`LOADING`])
            DUBTRACK.ELS.MAINLOADINGTEXT.HTML(LANGTEXT)

            DUBTRACK.ELS.MAINLOADING.SHOW()
        },

        "HIDE^MAIN^LOADING": _ => {
            DUBTRACK.ELS.MAINLOADING.HIDE()
        },

        CONTROLS: (EL, OBJECT, _$CC, _$BTN, _$POE) => {
            //CREATE CONTROL ELEMENTS
            $.EXTEND(OBJECT, LC_OBJ({
                "LOADING^EL": $(Δ`<DIV CLASS=LOADING>^LOADING...</>`).APPENDTO(EL),
                "BUFFERING^EL": $(Δ`<DIV CLASS=BUFFERING>^BUFFERING...</>`).HIDE().APPENDTO(EL),
                "REPLAY^EL": $(Δ`<DIV CLASS=REPLAY>REPLAY</>`).APPENDTO(EL),
                "ERROR^EL": $(Δ`<DIV CLASS=ERROR>^AN UNEXPECTED ERROR OCCURRED, PLEASE TRY AGAIN LATER</>`).HIDE().APPENDTO(EL),
                "CONTROLS^CONTAINER": _$CC = $(Δ`<DIV CLASS=CONTROL^CONTAINER>`).APPENDTO(EL),

                "BUTTONS^EL": _$BTN = $(Δ`<DIV CLASS=BUTTONS>`).APPENDTO(_$CC),
                "PLAY^EL": $(Δ`<A CLASS="PLAY NOACTION" HREF=#><SPAN CLASS="ICON-PLAY"></SPAN></>`).APPENDTO(_$BTN),
                "PAUSE^EL": $(Δ`<A CLASS="PAUSE NOACTION" HREF=#><SPAN CLASS="ICON-PAUSE"></></>`).HIDE().APPENDTO(_$BTN),
                "PROGRESS^OUTER^EL": _$POE = $(Δ`<DIV CLASS=PROGRESSCONTAINER>`).APPENDTO(_$CC),
                "PROGRESS^EL": $(Δ`<DIV CLASS=PROGRESS>`).APPENDTO(_$POE),
                "LOADED^EL": $(Δ`<DIV CLASS=LOADED>`).APPENDTO(_$POE),
                "VOLUME^CONTAINER": $(Δ`<DIV CLASS="VOLUME-CONTAINER"><SPAN CLASS="TOOLTIP"></SPAN><DIV CLASS="VOLUME-CONTROL"></DIV><SPAN CLASS="VOLUME"></SPAN></DIV>`).PREPENDTO(_$CC)
            }))
        }
    }),

    HELPERS: LC_OBJ({
        "GET^PARAMETER^BY^NAME": (NAME, _REGEX) => (
            (NAME = NAME.REPLACE(/[\[]/, "\\[").REPLACE(/[\]]/, "\\]"))
            ,(_REGEX = REGEXP("[\\?&]" + NAME + "=([^&#]*)"))
            ,(RESULTS = _REGEX.EXEC(LOCATION[Δ`SEARCH`]))
            ,RESULTS === NULL
                ? ""
                : DECODEURICOMPONENT(RESULTS[1].REPLACE(_REGEX('\+', Δ`G`), " "))
        ),

        "IS^DUBTRACK^ADMIN": (USERID) => USERID && [
            "52C821781E2B1FD945000001",
            "52C8EF6037E22B0200000005",
            "52D24BFF4CF9670200000515",
            "52C8EFCF37E22B0200000008",
            "551D295433CD73030089D184",
            "53F7C199892B010200A98809",
            "52C8254CA7B7260200000001"
        ].INDEXOF(USERID.TOUPPERCASE()) != -1

        ,
        COOKIE: LC_OBJ({
            // SETS A COOKIE
            SET: (NAME, VALUE, DAYS, SESSION, _EXPIRES) => {
                _EXPIRES = ""

                ;(DAYS && SESSION !== TRUE) && (
                    (_DATE = NEW(DATE)),
                    _DATE.SETTIME(_DATE.GETTIME() + (DAYS * 24 * 60 * 60 * 1000))
                    ,(_EXPIRES = Δ`; EXPIRES=${_DATE.TOGMTSTRING()}`)
                )

                DOCUMENT[Δ`COOKIE`] = Δ`${NAME}=${ENCODEURICOMPONENT(VALUE)}${_EXPIRES}; PATH=/`
            },

            // GETS A COOKIE
            GET: (NAME, _NAMEEQ, _CA, _RES = NULL) => (
                (_NAMEEQ = NAME + "=")
                ,(_CA = DOCUMENT[Δ`COOKIE`].SPLIT(';'))

                , _CA.FOREACH(C => {
                    C = TRIM(C)

                    ,(C.INDEXOF(_NAMEEQ) === 0) && (
                        _RES = DECODEURICOMPONENT(C.SUBSTRING(_NAMEEQ[Δ`LENGTH`], C[Δ`LENGTH`]))
                    )
                })

                , _RES
            ),

            // DELETE COOKIE
            DELETE: (NAME) => {
                DUBTRACK.HELPERS.COOKIE.SET(NAME, "", -1, FALSE)
            }
        }),

        PARSE: (RESPONSE, XHR) => RESPONSE[Δ`DATA`],

        IMAGE: LC_OBJ({
            "IMAGE^ERROR": (IMAGE, SRC) => (
                (IMAGE[Δ`ONERROR`] = "")
                ,(IMAGE[Δ`SRC`] = SRC
                    ? DUBTRACK.CONFIG.URLS.MEDIABASEURL + SRC
                    : DUBTRACK.CONFIG.URLS.MEDIABASEURL + Δ`/ASSETS/IMAGES/MEDIA/PIC_NOTFOUND.JPG`
                )
                ,TRUE
            ),

            "GET^IMAGE": (USERID, USERNAME, LARGE, ROOMPOPUP, _CLICKAC) => (
                (_CLICKAC = Δ`^DUBTRACK.HELPERS.DISPLAY^USER('${USERID}', THIS);`)
                , (SRC = DUBTRACK.CONFIG.APIURL + DUBTRACK.CONFIG.URLS.USERIMAGE.REPLACE(Δ`:ID`, USERID))

                , (LARGE) && (
                    SRC += "/LARGE"
                )

                ,(!ROOMPOPUP) && (
                    _CLICKAC = (USERNAME && USERNAME !== NULL) ? Δ`DUBTRACK.APP.NAVIGATE('/${USERNAME}', {TRIGGER: TRUE});` : ''
                )

                , Δ`<IMG SRC="${SRC}"  ALT="${USERNAME}" ONCLICK="${_CLICKAC}" CLASS="CURSOR-POINTER" ONERROR="^DUBTRACK.HELPERS.IMAGE.IMAGE^ERROR(THIS);" />`

            ),

            "GET^PROFILE^IMG": (ID, USERNAME, OAUTH, TYPE, _SRC, _CLICKAC) => (
                (_SRC = ""), (_CLICKAC = Δ`DUBTRACK.HELPERS.DISPLAYUSER('${ID}', THIS);`)
                , (TYPE = TYPE.TOUPPERCASE())
                , (OAUTH = OAUTH.TOUPPERCASE())
                , (_SRC = OAUTH == "FACEBOOK"
                ? (
                    (TYPE = (!TYPE
                        ? 'SQUARE'
                        : TYPE === 'LARGE'
                        ? 'LARGE'
                        : TYPE
                    ).TOLOWERCASE())
                    , Δ`HTTPS://GRAPH.FACEBOOK.COM/${ID}/PICTURE?TYPE=${TYPE}`
                ) : OAUTH == "GOOGLE"
                ? (
                    (TYPE = !TYPE ? '' : Δ`?SZ=200`)
                    , Δ`HTTPS://PLUS.GOOGLE.COM/S2/PHOTOS/PROFILE/${ID}${TYPE}`
                ) : OAUTH == "SOUNDCLOUD" ? Δ`HTTP://MEDIA.DUBTRACK.FM/MEDIA/SOUNDCLOUD.PNG` : (
                    (TYPE = (!TYPE
                        ? 'BIGGER'
                        : TYPE === 'LARGE'
                        ? 'ORIGINAL'
                        : TYPE == 'SQUARE'
                        ? 'NORMAL'
                        : TYPE
                    ).TOLOWERCASE())
                    , Δ`HTTPS://API.TWITTER.COM/1/USERS/PROFILE_IMAGE?ID=${ID}&SIZE=${TYPE}`
                ))


                , Δ`<IMG SRC="${_SRC}"  ALT="${USERNAME}" ONCLICK="${_CLICKAC}" CLASS="CURSOR-POINTER" ONERROR="^DUBTRACK.HELPERS.IMAGE.IMAGE^ERROR(THIS);" />`
            )
        }),

        "DISPLAY^USER": (ID, EL, _OFFSET, _LEFT, _TOP, _UP, _UP$EL) => {
            _UP = DUBTRACK.VIEWS[Δ`USER_POPOVER`]
            ;(!_UP) && (
                _UP = DUBTRACK.VIEWS[Δ`USER_POPOVER`] = NEW(DT.GLOBAL[Δ`USER^POPOVER`])
                , _UP[Δ`$EL`].APPENDTO('BODY')
            )
            _UP$EL = _UP[Δ`$EL`]

            _UP[Δ`DISPLAYUSER`](ID)

            _OFFSET = $(EL).OFFSET()
            _LEFT = _OFFSET.LEFT - 200
            _TOP = _OFFSET.TOP

            ;(_LEFT < 0) && (
                _LEFT = 0
            )
            ;(_TOP < 0) && (
                _TOP = 0
            )

            CONSOLE.LOG('TEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', TOP)

            _UP$EL.CSS({
                'LEFT': _LEFT,
                'TOP': _TOP
            }).SHOW()

            //SETTOP
            _UP.OFFSET_TOP = _OFFSET.TOP($(WINDOW).HEIGHT() < _OFFSET.TOP + _UP$EL.HEIGHT()) && (
                TOP = _OFFSET.TOP - _UP$EL.HEIGHT()

                , (TOP < 0) && (
                    TOP = 0
                )

                , _UP$EL.CSS({
                    TOP: TOP
                })
            )
        },

        "FLASH^LOGIN": _ => {
            $(Δ`#HEADER_LOGIN`).STOP(TRUE).FADEIN(300).FADEOUT(300).FADEIN(300).FADEOUT(300).FADEIN(300)
        },

        "NAVIGATE^HISTORY^TAGS": (EL) => {

            EL.FIND(Δ`A.NAVIGATE`)

            .UNBIND(Δ`CLICK`)

            //LOAD ALL NAVIGATE A TAGS
            .BIND(Δ`CLICK`, (THIS => (
                $HREF = $(THIS).ATTR("HREF")

                , ($HREF) && (
                    DUBTRACK.APP.NAVIGATE($HREF, {
                        TRIGGER: TRUE
                    })
                ), FALSE
            )).WRAP())
        },

        PLAYLIST: LC_OBJ({
            "ADD^QUEUE": (IDFK, TYPE, CALLBACK, _URL) => {
                ;(DUBTRACK.ROOM) ? (
                    (_URL = DUBTRACK.CONFIG.APIURL + DUBTRACK.CONFIG.URLS.ROOMQUEUE.REPLACE(Δ`{ID}`, DUBTRACK.ROOM.MODEL.ID))

                    , DUBTRACK.HELPERS.SENDREQUEST(_URL, LC_OBJ({
                        'SONG^ID': IDFK,
                        'SONG^TYPE': TYPE
                    }), 'POST', CALLBACK)
                ) : (
                    CALLBACK && CALLBACK.CALL(W, NULL)
                )
            },

            "REMOVE^QUEUE": (SONGID, CALLBACK, _URL) => {
                (DUBTRACK.ROOM) ? (
                    (_URL = DUBTRACK.CONFIG.APIURL + DUBTRACK.CONFIG.URLS.ROOMQUEUE.REPLACE(Δ`{ID}`, DUBTRACK.ROOM.MODEL.ID) + '/' + SONGID)

                    , DUBTRACK.HELPERS.SENDREQUEST(_URL, {}, 'DELETE', CALLBACK)
                ) : (
                    CALLBACK && CALLBACK.CALL(W, NULL)
                )
            }
        }),

        "GEN^PLAYLIST^CONTAINER": (EL, POS, SONGID, TYPE, CLASSNAME) => {
            (DUBTRACK.CREATEPLAYLIST) && DUBTRACK.CREATEPLAYLIST[Δ`CLOSE`]()

            DUBTRACK.APP.LOADUSERPLAYLISTS(_ => {
                DUBTRACK.CREATEPLAYLIST = EVAL(`NEW ^DUBTRACK.^VIEW.CONTAINER^EL^CREATE({
                    "^MODEL": DUBTRACK.USER.PLAYLIST
                }))`).RENDER(EL, POS, SONGID, TYPE)

                ;(CLASSNAME) && DUBTRACK.CREATEPLAYLIST.$EL.ADDCLASS(CLASSNAME)

                ;(!DT[Δ`BINDED^DOCUMENT`]) && (
                    $(WINDOW).ON(Δ`CLICK`, (E) => {
                        ($PARENTS = $(E.TARGET).PARENTS(Δ`.PLAYLIST-OPTIONS`))

                        ,($PARENTS.LENGTH === 0 && DUBTRACK.CREATEPLAYLIST) && DUBTRACK.CREATEPLAYLIST[Δ`CLOSE`]()
                    })

                    , DT[Δ`BINDED^DOCUMENT`] = TRUE
                )
            })
        },

        "SEND^REQUEST": (URL, DATA, TYPE, CALLBACK, CTX) => {
            (!CTX) && (CTX = DUBTRACK.HELPERS)

            CONSOLE.LOG(Δ`^<DUBTRACK> SENDING ${TYPE} REQUEST ${URL}`)
            //SEND AJAX REQUEST
            $.AJAX({
                URL: URL,

                DATA: DATA,

                TYPE: TYPE,

                "XHR^FIELDS": LC_OBJ({
                    "WITH^CREDENTIALS": TRUE
                }),

                SUCCESS: (R) => {
                    TRY(_ => CALLBACK && CALLBACK.CALL(CTX, NULL, R))
                },

                ERROR: (R, XHR, ERR) => {
                    TRY(_ => ERR = $.PARSEJSON(R.RESPONSETEXT))
                    CALLBACK && CALLBACK.CALL(CTX, ERR, NULL)
                }
            }, Δ`JSON`)

        },

        "DISPLAY^DUBS": (USERID, SETDUBS, MESSAGE, _DTUSER, _$DIV) => (

            (!MESSAGE) && (MESSAGE = '')

            , (_DTUSER = DUBTRACK.APP[Δ`ROOMAVATARLIST`][Δ`COLLECTION`][Δ`GET`](USERID))

            , (_DTUSER) && (
                (DUBS = PARSEINT(_DTUSER.GET(Δ`DUBS`)) + SETDUBS)
                , _DTUSER.SET(LC_OBJ({
                    "DUBS": DUBS
                }))

                , (_$DIV = $(Δ`<DIV CLASS=DUBDISPLAY><B>${MESSAGE} +${SETDUBS} DUB</B><SPAN>${DUBS}</SPAN></>`).APPENDTO(_DTUSER.VIEWEL.$EL))
                , SETTIMEOUT(_ => {
                    _$DIV.REMOVE()
                }, 1500)

            )

            , FALSE
        ),

        "LOAD^DEPENDENCIES^EL": (CALLBACK) => {
            DUBTRACK.LAYOUT = NEW(DUBTRACK.VIEW[Δ`^LAYOUT^VIEW`])
            DUBTRACK[Δ`PLAYER^CONTROLLER`] = NEW(DUBTRACK.VIEW[Δ`^PLAYER^CONTROLLER`])

            CALLBACK && CALLBACK.CALL()
        },

        "LOAD^DEPENDENCIES": (CALLBACK) => {
            $.EXTEND( DUBTRACK, {
                USER: LC_OBJ({
                    LOGGEDIN: FALSE
                })
            })
            //LOAD MAIN ELEMENTS
            DUBTRACK.ELS.INIT()

            //LOAD USER
            $.EXTEND( DUBTRACK, LC_OBJ({
                SESSION: CAPSIFY(NEW(DUBTRACK.MODEL[Δ`^USER`])),
                "LOGGED^IN": FALSE
            }))
            $.EXTEND( DUBTRACK.SESSION, LC_OBJ({
                URLROOT: DUBTRACK.CONFIG.APIURL + DUBTRACK.CONFIG.URLS.SESSION,
                PARSE: DUBTRACK.HELPERS.PARSE
            }))
            DUBTRACK.SESSION[Δ`FETCH`](LC_OBJ({
                SUCCESS: (MODEL, R) => {
                    DUBTRACK[Δ`LOGGED^IN`] = TRUE
                    DUBTRACK.HELPERS.LOADDEPENDENCIESEL(CALLBACK)
                    DUBTRACK[Δ`CACHE`][Δ`USERS`][Δ`ADD`](R.DATA)
                },
                ERROR: _ => {
                    DUBTRACK.HELPERS.LOADDEPENDENCIESEL(CALLBACK)
                }
            }))
        },

        "DISPLAY^ERROR": ($TITLE, $MESSAGE, $REFRESH, ONCLICK, _$DIV) => {

            $(Δ`#WARNING`).REMOVE()

            _$DIV = $(Δ`<DIV ID=WARNING><H3${$TITLE}</H3><P>${$MESSAGE}</P></>`).APPENDTO('BODY')

            ,($REFRESH)
                ? $(Δ`<BUTTON ONCLICK='LOCATION.RELOAD();RETURN FALSE;'>${DUBTRACK_LANG["GLOBAL".LC]["REFRESH".LC]}</BUTTON>`).APPENDTO(_$DIV)
                : (
                    ONCLICK || (ONCLICK = Δ`$("#WARNING").REMOVE();RETURN FALSE;`)
                    , $(Δ`<BUTTON ONCLICK=${ONCLICK}>^OK</BUTTON>`).APPENDTO(_$DIV)
                )
        },

        TEXT: LC_OBJ({
            "SHORTEN^LINK": (DISPLAYLINK, MAXLIMIT) => (
                (DISPLAYLINK.LENGTH > MAXLIMIT) && (
                    DISPLAYLINK = DISPLAYLINK.SUBSTRING(0, MAXLIMIT) + "..."
                ), DISPLAYLINK
            ),

            "SHORTEN^MESSAGE": (TEXT, MAXLIMIT) => TEXT.SUBSTRING(0, MAXLIMIT),

            "CONVERT^HTMLTO^TAGS": (TEXT, IMAGLOADFUN, _IMAGEREGEX) => {
                (_IMAGEREGEX = REGEXP(Δ`^(HTTP|HTTPS)(.*)\\.(PNG|JPG|JPEG|GIF)$`))

                , (TEXT = TEXT.REPLACE(REGEXP(Δ`(\\B(?:HTTPS?|FTP):\/\/[A-Z0-9-+&@#\/%()[\\]?=~_|!:,.;]*[A-Z0-9-+&@#\/%=~_|])`, Δ`GIM`)
                    , (STR) => (
                    (!DUBTRACK.HIDEIMAGES && STR.MATCH(_IMAGEREGEX))
                        ? Δ`<A HREF="${STR}" CLASS="AUTOLINK" TARGET="_BLANK"><IMG SRC="${STR}" ALT="${STR}" ONLOAD="${IMAGLOADFUN}" ONERROR="^DUBTRACK.HELPERS.IMAGE.IMAGE^ERROR(THIS, '/ASSETS/IMAGES/MEDIA/CHAT_IMAGE_LOAD_ERROR.PNG');" /></A>`
                        : Δ`<A HREF="${STR}" CLASS="AUTOLINK" TARGET="_BLANK">${DUBTRACK.HELPERS.TEXT.SHORTENLINK(STR, 60)}</A>`
                )))

                , TEXT
            },

            "SHRINK^IMG": (SRC, _IMG) => {
                _IMG = $(SRC)

                ,(_IMG.WIDTH() === 20) ? _IMG.ANIMATE({
                    WIDTH: "100%",
                    HEIGHT: "100%"
                }, 500) : _IMG.ANIMATE({
                    WIDTH: Δ`20PX`,
                    HEIGHT: Δ`20PX`
                }, 500)
            },

            "CONVERT^ATTO^LINK": (TEXT) => TEXT.REPLACE(REGEXP(Δ`(@[\\W.]+)`, Δ`G`), Δ`<SPAN CLASS="USERNAME-HANDLE">$&</SPAN>`)
        }),
    }),

    APP: NULL, // MAIN DUBTRACK
    "DUBTRACK^PLAYER": NULL // MAIN DUBTRACK PLAYER
})