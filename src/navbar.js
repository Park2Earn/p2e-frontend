
import AppBar from '@material-ui/core/AppBar'
import { Grid } from '@material-ui/core'
import Link from 'next/link'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    menuButtons: {
        color: "white",
        fontSize: "15px",
        fontWeight: 700,
        // margin: "0 8px 0px 8px",
        "&:hover": {
            textDecoration: "underline black",
        }
    },
}))

export default function NavBar() {
    const classes = useStyles();

    return (
        <AppBar style={{ background: '#822b50' }} elevation={0} position="static">
            <Grid container item xs={12}>
                <Grid container item xs={3} justifyContent="center">
                </Grid>

                <Grid container item xs={6} style={{padding: "15px"}}>
                        <Grid container item xs={3} justifyContent="flex-start">
                            <Link href={'/'} passHref>
                                <Button component="a" className={classes.menuButtons}>
                                    Park2Earn
                                </Button>
                            </Link>
                        </Grid>
                        <Grid container item xs={2} justifyContent="center">
                            <Link href={'/deposit'} passHref>
                                <Button component="a" className={classes.menuButtons}>
                                    Deposit
                                </Button>
                            </Link>
                        </Grid>
                        <Grid container item xs={3} justifyContent="center">
                            <Link href={'/newproposal'} passHref>
                                <Button component="a" className={classes.menuButtons}>
                                    New Proposal
                                </Button>
                            </Link>
                        </Grid>
                        <Grid container item xs={2} justifyContent="center">
                            <Link href={'/proposals'} passHref>
                                <Button component="a" className={classes.menuButtons}>
                                    Proposals
                                </Button>
                            </Link>
                        </Grid>
                        <Grid container item xs={2} justifyContent="center">
                            <Link href={'/winners'} passHref>
                                <Button component="a" className={classes.menuButtons}>
                                    Winners
                                </Button>
                            </Link>
                        </Grid>
                </Grid>

                <Grid container item xs={3} justifyContent="center">
                </Grid>
            </Grid>
        </AppBar>
    )
}
