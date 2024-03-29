import * as   React from 'react';
import Link, { ButtonLink } from './Link';
import mobx from './mobx.png';
import {WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import { observer } from 'mobx-react';
import AppState from '../stores/AppState';
import { runInAction } from 'mobx';
import { grey } from '@material-ui/core/colors';

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100vh'
  },
  appBar: {
  },
  title: {
    whiteSpace: 'nowrap'
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  toolbar: {
    height: 100,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    overflowY: 'scroll'
  },
  flex: {
    flexGrow: 1
  },
  link: {
    display: 'block'
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 4,
  },
  searchFormControl: {
    marginLeft: theme.spacing.unit * 4,
    marginRight: theme.spacing.unit * 4,
    padding: theme.spacing.unit / 2,
    background: `#ffffffa0`,
    borderRadius: '2px',
    width: '100%'
  },
  searchInput: {
  },
});

interface Props extends WithStyles<typeof styles> {
  appState: AppState;
}

@observer
class Core extends React.Component<Props> {

  onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.appState.setSearchTerm(e.target.value);
  };

  onSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.props.appState.searchForSites();
    }
  };

  get drawer() {
    const { classes } = this.props;
    return <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <ListItem button>
          <ListItemText>
            <Link className={classes.link} href="/add">Add</Link>
          </ListItemText>
        </ListItem>
      </List>
    </Drawer>;
  }
  render() {
    const { appState, classes, children } = this.props;
    const { state } = appState;

    return <div className={classes.appFrame}>
      <AppBar
        position="absolute"
        className={classes.appBar}>
        <Toolbar>
          <Typography
            variant="title"
            color="inherit"
            className={`${classes.title} ${classes.flex}`}>
            {state.loggedInAs && `Welcome, ${state.loggedInAs}!`}
          </Typography>
          {state.loggedInAs && <FormControl
            className={`${classes.flex} ${classes.searchFormControl}`}
          >
            <Input
              id="search-site-name"
              value={state.searchTerm}
              placeholder="Enter site name"
              className={classes.searchInput}
              onChange={this.onSearch}
              onKeyPress={this.onSearchKeyPress}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>}
          {state.loggedInAs
            ? <Button onClick={appState.logout} color="inherit">Logout</Button>
            : [
              <ButtonLink key="0" href="/login" color="inherit">Login</ButtonLink>,
              <ButtonLink key="1" href="/register" color="inherit">Register</ButtonLink>,
            ]}
        </Toolbar>
      </AppBar>
      {/* {this.drawer} */}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
      {state.loggedInAs &&
        <ButtonLink href="/add" variant="fab" className={classes.fab} color="primary">
          <AddIcon />
        </ButtonLink>}
    </div>
  }
}

export default withStyles(styles)(Core);