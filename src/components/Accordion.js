import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
// import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});


export default function AccordionSection({ SubTasks, Check, item }) {

  let { id, title, status, created_at, subtasks } = item

  const classes = useStyles();
  return (<div className={classes.root}>
    <Accordion className="px-2 mb-2">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
      >

        <FormControlLabel
          aria-label="Acknowledge"
          onClick={(event) => event.stopPropagation()}
          onFocus={(event) => event.stopPropagation()}
          control={
            <Check />
          }
          label={title}
        />
      </AccordionSummary>
      <AccordionDetails>

        <React.Fragment>
          {SubTasks ? <SubTasks /> : 'no details as yet'}
        </React.Fragment>

      </AccordionDetails>
    </Accordion>
  </div>)
}
