import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '85%',
        margin: '0px',
        flexShrink: 0
    },
    secondaryHeading: {
        fontSize: 'smaller',
        paddingTop: '0.75rem!important',
        color: theme.palette.text.secondary,
        flexShrink: 0,
        flexBasis: '15%'
    }
}))

export default function AccordionSection({ SubTasks, Check, item, finishedCount }) {

    const classes = useStyles()
    return (<div className={classes.root}>
        <Accordion className="px-2 mb-2 accordion-wrap">
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-label="Expand"
                aria-controls="additional-actions1-content"
                id="additional-actions1-header">

                <FormControlLabel
                    className={classes.heading}
                    aria-label="Acknowledge"
                    onClick={(event) => event.stopPropagation()}
                    onFocus={(event) => event.stopPropagation()}
                    control={
                        <Check />
                    }
                    label={item.title}
                />
                <Typography className={classes.secondaryHeading}>Done {finishedCount}/{item.subtasks.length} </Typography>

            </AccordionSummary>

            <AccordionDetails>

                <React.Fragment>
                    {SubTasks ? <SubTasks /> : 'no details as yet'}
                </React.Fragment>

            </AccordionDetails>
        </Accordion>
    </div>)
}
