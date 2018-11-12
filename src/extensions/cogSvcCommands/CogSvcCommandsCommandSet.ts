import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import pnp from 'sp-pnp-js';
import * as $ from 'jquery';



import TextAnalyticsDialog from './TextAnalyticsDialog';
import * as strings from 'CogSvcCommandsCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICogSvcCommandsCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
  lang: string;
  sentiment: string;
  keyPhrases: string;
}

const LOG_SOURCE: string = 'CogSvcCommandsCommandSet';

export default class CogSvcCommandsCommandSet extends BaseListViewCommandSet<ICogSvcCommandsCommandSetProperties> {
  private _colorCode: string;
  

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CogSvcCommandsCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
      console.log("Analyze clicked");
      const itemId: number = event.selectedRows[0].getValueByName('ID');
      var serverRelativeUrl = "";
      var lang = "";
      var sentiment = "";
      var keyPhrases = "";
      var sent = "";
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).select('File/ServerRelativeUrl').expand('File').get()
        .then((item: any) => {
          serverRelativeUrl = item.File.ServerRelativeUrl;
          
          pnp.sp.web.getFileByServerRelativeUrl(serverRelativeUrl).getText().then((text: string) => {
      
            //-----------------------------
            // Get the language of the text
            var paramsLang = {
              "documents": [
                {
                  "id": "1",
                  "text": text
                }
              ]
            };
            $.ajax({
              method: 'POST',
              url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages?" + $.param(paramsLang),
              headers:{
                "Content-Type":"application/json",
                "Ocp-Apim-Subscription-Key":"7991ac88998147a59ae3dc42940a87a4",
                "Accept":"application/json"
              },
              data: JSON.stringify(paramsLang),
              dataType: 'text',
            })
            .done(function(data) {
                var obj = $.parseJSON(data);
                console.log('Language: ' + obj.documents[0].detectedLanguages[0].iso6391Name);
                lang = obj.documents[0].detectedLanguages[0].iso6391Name;
                //-----------------------------
                // Get the sentiment of the text
                var paramsSentiment = {
                  "documents": [
                    {
                      "language": lang,
                      "id": "1",
                      "text": text
                    }
                  ]
                };
                $.ajax({
                  method: 'POST',
                  url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment?" + $.param(paramsSentiment),
                  headers:{
                    "Content-Type":"application/json",
                    "Ocp-Apim-Subscription-Key":"7991ac88998147a59ae3dc42940a87a4",
                    "Accept":"application/json"
                  },
                  data: JSON.stringify(paramsSentiment),
                  dataType: 'text',
                })
                .done(function(data) {
                    var obj = $.parseJSON(data);
                    console.log('Sentiment: ' + obj.documents[0].score);
                    sentiment = obj.documents[0].score;
                    //-----------------------------
                    // Get the key phrases of the text
                    var paramskeyPhrases = {
                      "documents": [
                        {
                          "language": lang,
                          "id": "1",
                          "text": text
                        }
                      ]
                    };
                    console.log(sent);
                    $.ajax({
                      method: 'POST',
                      url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases?" + $.param(paramskeyPhrases),
                      headers:{
                        "Content-Type":"application/json",
                        "Ocp-Apim-Subscription-Key":"7991ac88998147a59ae3dc42940a87a4",
                        "Accept":"application/json"
                      },
                      data: JSON.stringify(paramskeyPhrases),
                      dataType: 'text',
                    })
                    .done(function(data) {
                        var obj = $.parseJSON(data);
                        keyPhrases = obj.documents[0].keyPhrases;
                        console.log("KeyPhrases " + keyPhrases);
                        console.log(lang);
                        console.log(sentiment);
                        Dialog.alert(`The sentiment of your text is ${sentiment} and the key phrases are:\r\n\n${keyPhrases}`);
                    })
                    .fail(function(data) {
                        alert("error" + JSON.stringify(data));
                    });
                })
                .fail(function(data) {
                    alert("error" + JSON.stringify(data));
                });
              })
              .fail(function(data) {
                  alert("error" + JSON.stringify(data));
              });
          });
        });
        break;
      
      
      case 'COMMAND_2':
        
      const itemIdTranslate: number = event.selectedRows[0].getValueByName('ID');
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemIdTranslate).select('File/ServerRelativeUrl').expand('File').get()
      .then((item: any) => {
        serverRelativeUrl = item.File.ServerRelativeUrl;
        var translation = "";
        pnp.sp.web.getFileByServerRelativeUrl(serverRelativeUrl).getText().then((text: string) => {


          /*

          let subscriptionKey = 'd227540b06d1470e931a7b9d832cedb1';

          let host = 'api.cognitive.microsofttranslator.com';
          let path = '/translate?api-version=3.0';

          // Translate to German and Italian.
          let params = '&to=de';

          

          let response_handler = function (response) {
              let body = '';
              response.on ('data', function (d) {
                  body += d;
              });
              response.on ('end', function () {
                  let json = JSON.stringify(JSON.parse(body), null, 4);
                  console.log(json);
              });
              response.on ('error', function (e) {
                  console.log ('Error: ' + e.message);
              });
          };

          let get_guid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }

          let Translate = function (content) {
              let request_params = {
                  method : 'POST',
                  hostname : host,
                  path : path + params,
                  headers : {
                      'Content-Type' : 'application/json',
                      'Ocp-Apim-Subscription-Key' : subscriptionKey,
                      'X-ClientTraceId' : get_guid (),
                  }
              };

              let req = https.request (request_params, response_handler);
              req.write (content);
              req.end ();
          }

          let content = JSON.stringify ([{'Text' : text}]);

          Translate (content);
          
          */
          
          
    
          //-----------------------------
          // Translate the text
          console.log(text);
          var paramsText =
              { "Text": text };

          var paramsTextTranslate = [{'Text' : text}];
          console.log(paramsText);
          $.ajax({
            method: 'POST',
            url: "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=de",
            headers:{
              "Content-Type":"application/json",
              "Ocp-Apim-Subscription-Key":"d227540b06d1470e931a7b9d832cedb1",
              "Accept":"application/json"
            },
            data: JSON.stringify(paramsTextTranslate),
            dataType: 'text',
          })
          .done(function(data) {
              var obj = $.parseJSON(data);
              console.log(obj);
              translation = obj[0].translations[0].text;
              console.log(translation);
              Dialog.alert(`Here is your translation:\n\n ${translation}`);

            })
            .fail(function(data) {
                alert("error" + JSON.stringify(data));
            });
        });
        
      });
    



        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
