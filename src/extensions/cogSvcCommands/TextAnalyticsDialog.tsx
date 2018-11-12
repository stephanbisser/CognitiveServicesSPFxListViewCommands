import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  ColorPicker,
  PrimaryButton,
  Button,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';

interface ITextAnalyticsDialogContentProps {
  language: string;
  sentiment: string;
  keyPhrases: string;
  close: () => void;
  submit: (color: string) => void;
  defaultColor?: string;
}

class TextAnalyticsDialogContent extends React.Component<ITextAnalyticsDialogContentProps, {}> {
  private _pickedColor: string;

  constructor(props) {
    super(props);
    // Default Color
    this._pickedColor = props.defaultColor || '#FFFFFF';
  }

  public render(): JSX.Element {
    return <DialogContent
      title='Your analysis results are here'
      subText={this.props.language}
      onDismiss={this.props.close}
      showCloseButton={true}
    >
      <ColorPicker color={this._pickedColor} onColorChanged={this._onColorChange} />
      <DialogFooter>
        <Button text='Cancel' title='Cancel' onClick={this.props.close} />
        <PrimaryButton text='OK' title='OK' onClick={() => { this.props.submit(this._pickedColor); }} />
      </DialogFooter>
    </DialogContent>;
  }

  @autobind
  private _onColorChange(color: string): void {
    this._pickedColor = color;
  }
}

export default class TextAnalyticsDialog extends BaseDialog {
  public language: string;
  public sentiment: string;
  public keyPhrases: string;
  public colorCode: string;

  public render(): void {
    ReactDOM.render(<TextAnalyticsDialogContent
      close={ this.close }
      language={ this.language }
      sentiment={ this.sentiment }
      keyPhrases={ this.keyPhrases }
      defaultColor={ this.colorCode }
      submit={ this._submit }
    />, this.domElement);
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

  @autobind
  private _submit(color: string): void {
    this.colorCode = color;
    this.close();
  }
}