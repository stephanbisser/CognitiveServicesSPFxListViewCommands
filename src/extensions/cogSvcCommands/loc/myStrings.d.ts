declare interface ICogSvcCommandsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CogSvcCommandsCommandSetStrings' {
  const strings: ICogSvcCommandsCommandSetStrings;
  export = strings;
}
