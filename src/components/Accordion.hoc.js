import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});


export default function AccordionSection({ Todos,Check, item, inx, onUpdate,checked }) {

  let { id, title, status, created_at, subtasks } = item


//   <AccordionSummary
//   expandIcon={<ExpandMoreIcon />}
//   aria-controls="panel1a-content"
//   id="panel1a-header"
// >
//   <Typography className={classes.heading}>Accordion 1</Typography>
// </AccordionSummary>

  const classes = useStyles();
  return (<div className={classes.root}>
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
      >
 
        <FormControlLabel
          aria-label="Acknowledge"
        //  onClick={(event) => event.stopPropagation()}
        //  onFocus={(event) => event.stopPropagation()}
          control={
            <Check/>
            }
          label={title}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Todos />
      </AccordionDetails>
    </Accordion>
  </div>)
}
