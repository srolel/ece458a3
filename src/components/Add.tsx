import * as React from 'react';
import { observer } from 'mobx-react';
import AppState from '../stores/AppState';
import Link from './Link';
import { withStyles, createStyles, WithStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { action, observable, runInAction } from 'mobx';
import { green } from '@material-ui/core/colors';
import Form from './Form';

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  form: {
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

interface Props extends WithStyles<typeof styles> {
  appState: AppState;
  context: 'login' | 'register'
}

@observer
export class Add extends React.Component<Props, any> {
  componentDidMount() {
    this.resetForm();
  }

  @observable mState = {
    loading: false,
    form: {
      site: '',
      site_username: '',
      site_password: ''
    }
  };

  resetForm = action(() => {
    this.mState.form = {
      site: '',
      site_username: '',
      site_password: ''
    };
  })

  onSubmit = action(async (e: any) => {
    e.preventDefault();
    await this.props.appState.addSite(this.mState.form);
    this.resetForm();
  });

  onChangeSite = action((e: React.ChangeEvent<HTMLInputElement>) => {
    this.mState.form.site = e.target.value;
  });

  onChangeSiteUsername = action((e: React.ChangeEvent<HTMLInputElement>) => {
    this.mState.form.site_username = e.target.value;
  });

  onChangeSitePassword = action((e: React.ChangeEvent<HTMLInputElement>) => {
    this.mState.form.site_password = e.target.value;
  });

  render() {
    const { context, appState, classes } = this.props;
    return (
      <Grid justify="center" container spacing={24}>
        <Grid item xs={12} sm={10} md={8} lg={4} xl={3}>
          <Paper className={classes.paper}>
            <Grid justify="center" container>
              <Form
                buttonText="Add"
                successMessage="Site added successfully."
                onSubmit={this.onSubmit}>
                <Grid item xs={12}>
                  <FormControl required className={classes.formControl}>
                    <InputLabel htmlFor="username">Site</InputLabel>
                    <Input
                      id="username"
                      value={this.mState.form.site}
                      onChange={this.onChangeSite} />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="email">Username</InputLabel>
                    <Input
                      id="email"
                      value={this.mState.form.site_username}
                      onChange={this.onChangeSiteUsername} />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input
                      id="password"
                      value={this.mState.form.site_password}
                      onChange={this.onChangeSitePassword} />
                  </FormControl>
                </Grid>
              </Form>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Add);
