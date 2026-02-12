import PropTypes from 'prop-types';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from './MainCard';

// ==============================|| REPORT CARD ||============================== //

export default function ReportCard({ counter, title, iconPrimary: IconPrimary, footerData, color, iconFooter: IconFooter, coloredIcon }) {
  return (
    <MainCard
      actions={
        <Stack direction="row" sx={{ width: 1, justifyContent: 'space-between', textAlign: 'center ', color: 'common.white' }}>
          <Typography variant="subtitle2">{footerData}</Typography>
          {IconFooter && <IconFooter />}
        </Stack>
      }
      actionsDivider={false}
      cardActionsSX={{ bgcolor: color, py: 1.5 }}
      sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', color: '#000' }}
      contentSX={{ bgcolor: 'rgba(0, 0, 0, 0.02)', color: '#000' }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h4" sx={{ color: '#000' }}>
            {counter}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#000' }}>{title}</Typography>
        </Stack>
        {IconPrimary && <IconPrimary fontSize="large" sx={{ color: coloredIcon ? color : 'initial' }} />}
      </Stack>
    </MainCard>
  );
}

ReportCard.propTypes = {
  counter: PropTypes.string,
  title: PropTypes.string,
  iconPrimary: PropTypes.any,
  footerData: PropTypes.string,
  color: PropTypes.string,
  iconFooter: PropTypes.any,
  coloredIcon: PropTypes.bool
};
