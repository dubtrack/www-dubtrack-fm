__ = {}

// SIMPLE VALUES
FALSE = !1
FALSE_STR = ''+FALSE
TRUE = !0
TRUE_STR = ''+TRUE
UNDEFINED = []._
UNDEFINED_STR = ''+UNDEFINED
NAN = +[]._
NAN_STR = ''+NAN
INFINITY = 1/0
INFINITY_STR = ''+INFINITY

// [].FILTER
__.F = FALSE_STR[0]
__.I = UNDEFINED_STR[5]
__.L = FALSE_STR[2]
__.T = TRUE_STR[0]
__.E = TRUE_STR[3]
__.R = TRUE_STR[1]
STR_FILTER = __.F+__.I+__.L+__.T+__.E+__.R
FILTER = [][STR_FILTER]
FN_STR = ''+FILTER

// 'CONSTRUCTOR'
__.C = FN_STR[3]
__.O = FN_STR[6]
__.N = UNDEFINED_STR[1]
__.S = FALSE_STR[3]
__.U = UNDEFINED_STR[0]
__.C = FN_STR[3]
STR_CONSTR = __.C+__.O+__.N+__.S+__.T+__.R+__.U+__.C+__.T+__.O+__.R

// STRING CONSTRUCTOR
STRING = ''[STR_CONSTR]
STRING_STR = ''+STRING

// STRING::TOSTRING
__.G = STRING_STR[14]
STR_TOSTRING = __.T+__.O+'S'+__.T+__.R+__.I+__.N+__.G

// GET THE WHOLE ALPHABET
_I = 0
ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
;[37713647386641440, 61018880088125, 1867590395][STR_FILTER](
    _=> [..._[STR_TOSTRING](36)][STR_FILTER](
        L => __[ABC[_I++]] = L
))

// STRING HELPER
STR_RETURN_ = __.R+__.E+__.T+__.U+__.R+__.N+' '
FUNCTION = FILTER[STR_CONSTR]

STR_TOLOWERCASE = __.T+__.O+'L'+__.O+__.W+__.E+__.R+'C'+__.A+__.S+__.E
STR_TOUPPERCASE = __.T+__.O+'U'+__.P+__.P+__.E+__.R+'C'+__.A+__.S+__.E
STR_REPLACE = __.R+__.E+__.P+__.L+__.A+__.C+__.E
_LC_REGX = FUNCTION(`${STR_RETURN_}/\\^(<(.*?)>|[^\\W_]|\\^)/${__.G}`)()
LC = STR => STR[STR_TOLOWERCASE]()[STR_REPLACE](_LC_REGX, (_,L,C)=>(C||L)[STR_TOUPPERCASE]())

STR_MAP = __.M+__.A+__.P
STR_REDUCE = __.R+__.E+__.D+__.U+__.C+__.E
Δ = (ARRAY, ...ARGS) => ((ARGS[-1]=''), ARRAY[STR_MAP](LC)[STR_REDUCE]( (A, B, I) => A+ARGS[I-1]+B , ''))

STR_PROTOTYPE = LC('PROTOTYPE')
''[STR_PROTOTYPE]

// EVAL
EXEC = CODE => FUNCTION(LC(CODE))()
EVAL = CODE => FUNCTION(STR_RETURN_+LC(CODE))()

// LC'D FUNCTION CONSTRUCTOR
FN = EVAL(`FUNCTION(){ RETURN ^FUNCTION.APPLY(NULL, [].MAP.CALL(ARGUMENTS, ^L^C)) }`)

// GLOBAL
WINDOW = EVAL('THIS')
NULL = EVAL('NULL')

// BIND
STR_BIND = LC('BIND')
BIND = (OBJ, ATTR) => OBJ[ATTR][STR_BIND](OBJ)

// CAPSIFY OBJECTS
CAPSIFY = FN('OBJ', 'CAPS_ALL', `
    VAR K2
    FOR (KEY OF ^OBJECT.GET^OWN^PROPERTY^NAMES(OBJ)) {
        IF (
            !~['CALLER', 'ARGUMENTS', 'LENGTH'].INDEX^OF(KEY)
            && (CAPS_ALL || TYPEOF OBJ[KEY] == 'FUNCTION')
            && !((K2 = KEY.TO^UPPER^CASE()) IN OBJ)
        ) {
            OBJ.DEFINE(KEY.TO^UPPER^CASE(), OBJ[KEY])
        }
    }
    RETURN OBJ
`)

// UPPERCASE PROTOTYPE FUNCTIONS
EXEC(`
    VAR PROTO, DEFINE = FUNCTION(ATTR, VAL) {
        ^OBJECT.DEFINE^PROPERTY(THIS, ATTR, {
            __PROTO__: NULL, VALUE: VAL
        })
    }
    DEFINE.CALL(^OBJECT.PROTOTYPE, 'DEFINE', DEFINE)

    ^OBJECT.PROTOTYPE.DEFINE('DEFINE^GETTER', FUNCTION(ATTR, CB) {
        ^OBJECT.DEFINE^PROPERTY(THIS, ATTR, {
            __PROTO__: NULL, GET: CB
        })
    })

    FOR (CONSTR OF [^ARRAY, ^NUMBER, ^STRING, ^BOOLEAN, ^REG^EXP, ^OBJECT, ^FUNCTION, ^DATE, J^QUERY]) {
        ^<CAPSIFY>(
            CONSTR.^<PROTOTYPE> = CONSTR.PROTOTYPE
        )
    }
`)
CAPSIFY($)

// OBJECT
OBJECT = {} [STR_CONSTR]
CAPSIFY(OBJECT)

// FUNCTION WRAPPER (TO GET `THIS` AND `ARGUMENTS`)
FN_WRAPPER = EVAL(' FN => FUNCTION(){ RETURN FN.APPLY(THIS, [THIS, ARGUMENTS, ...ARGUMENTS]) } ')
FUNCTION.PROTOTYPE.DEFINE('WRAP', FN_WRAPPER(FN_WRAPPER))

// ADD LC TO THE STRING PROTOTYPE
STRING.PROTOTYPE.DEFINEGETTER('LC', FN_WRAPPER(LC))

// ADD ARRAY::LENGTH AND STRING::LENGTH
ARRAY = [] .CONSTRUCTOR
ARRAY.PROTOTYPE.DEFINEGETTER('LENGTH', FN('THIS.LENGTH'))
STRING.PROTOTYPE.DEFINEGETTER('LENGTH', FN('THIS.LENGTH'))

// FOR-HELPERS
_FOR_CB_WRAPPER = `
    TRY {
        CB(K)
    } CATCH (ERR) {
        IF (ERR == 'CONTINUE') CONTINUE
        ELSE IF (ERR == 'BREAK') BREAK
        ELSE IF (ERR && ERR.RETURN) RETURN ERR.VALUE
        ELSE THROW ERR
    }
`
FOR_ALL = BIND([], 'FOREACH')
FOR_IN = FN('OBJ', 'CB', `FOR(VAR K IN OBJ) ${_FOR_CB_WRAPPER}`)
FOR_OF = FN('OBJ', 'CB', `FOR(VAR K OF OBJ) ${_FOR_CB_WRAPPER}`)
UPTO = FN('FROM', 'TO', 'CB', `FOR(VAR K = FROM; K<TO; K++) ${_FOR_CB_WRAPPER}`)
DOWNTO = FN('FROM', 'TO', 'CB', `FOR(VAR K = FROM; K>TO; K--) ${_FOR_CB_WRAPPER}`)
WHILE = FN('COND', 'CB', `WHILE(COND()) ${_FOR_CB_WRAPPER}`)

// KEYWORD REPLACEMENTS/WRAPPERS
VOID = $.NOOP
IS_IN = FN('ATTR', 'OBJ', 'ATTR IN OBJ')
TRY_CATCH = FN('CB', 'ERR_HANDLER', 'TRY { CB() } CATCH(ERR) { ERR_HANDLER(ERR) }')
TRY = FN('CB', 'TRY_CATCH(CB, $.NOOP)')
THROW = FN('ERROR', 'THROW ERROR')
DELETE = FN('OBJ', 'ATTR', 'DELETE OBJ[ATTR]')
TYPEOF = FN('IT', 'RETURN TYPEOF IT')
INSTANCEOF = FN('A', 'B', 'RETURN A INSTANCEOF B')
NEW = FN('CLAZZ', 'RETURN NEW CLAZZ()')

// LC-FY AN OBJECT
LC_OBJ = (OBJ, RES) => (RES = {}, FOR_IN(OBJ, (K, TEMP) => {
    RES[LC(K)] = RES[K.SPLIT('^').JOIN('')] = OBJ[K]
}), RES)
LC_STRING_MAP = (OBJ, RES) => (RES = {}, FOR_IN(OBJ, (K, TEMP) => {
    RES[LC(K)] = RES[K.SPLIT('^').JOIN('')] = LC(OBJ[K])
}), RES)


// GLOBALS
DATE = EVAL("^DATE")
REGEXP = EVAL("^Reg^Exp")
DOCUMENT = WINDOW[Δ`DOCUMENT`]
LOCATION = WINDOW[Δ`LOCATION`]
ENCODEURICOMPONENT = WINDOW[Δ`ENCODE^U^R^I^COMPONENT`]
DECODEURICOMPONENT = WINDOW[Δ`DECODE^U^R^I^COMPONENT`]
SETTIMEOUT = WINDOW[Δ`SET^TIMEOUT`]
PARSEINT = WINDOW[Δ`PARSE^INT`]
CONSOLE = WINDOW[Δ`CONSOLE`]
CONSOLE.LOG = CONSOLE[Δ`LOG`]

// MORE HELPER FUNCTIONS
TRIM = $[Δ`TRIM`]