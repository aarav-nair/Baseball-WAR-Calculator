document.addEventListener('DOMContentLoaded', () => {
   let currentInputMode = 'hits';

   const calculateButton = document.getElementById('calculate-btn');
   const toggleHitsBtn = document.getElementById('toggle-hits');
   const toggleSinglesBtn = document.getElementById('toggle-singles');
   const hitsSinglesLabel = document.getElementById('hits-singles-label');

   toggleHitsBtn.addEventListener('click', () => setInputMode('hits'));
   toggleSinglesBtn.addEventListener('click', () => setInputMode('singles'));
   calculateButton.addEventListener('click', performCalculations);

   function setInputMode(mode) {
      if (currentInputMode === mode) return;
      currentInputMode = mode;

      if (mode === 'hits') {
         toggleHitsBtn.classList.add('active-toggle');
         toggleSinglesBtn.classList.remove('active-toggle');
         hitsSinglesLabel.textContent = 'Total Hits (H)';
      } else {
         toggleSinglesBtn.classList.add('active-toggle');
         toggleHitsBtn.classList.remove('active-toggle');
         hitsSinglesLabel.textContent = 'Singles (1B)';
      }
   }

   function performCalculations() {
      const inputs = {
         '2B': parseInt(document.getElementById('doubles').value) || 0,
         '3B': parseInt(document.getElementById('triples').value) || 0,
         'HR': parseInt(document.getElementById('homeruns').value) || 0,
         'BB': parseInt(document.getElementById('walks').value) || 0,
         'HBP': parseInt(document.getElementById('hbp').value) || 0,
         'AB': parseInt(document.getElementById('atbats').value) || 0,
         'SF': parseInt(document.getElementById('sacflies').value) || 0,
         'SB': parseInt(document.getElementById('sb').value) || 0,
         'CS': parseInt(document.getElementById('cs').value) || 0,
         'DRS': parseFloat(document.getElementById('drs').value) || 0, // For bWAR
         'UZR': parseFloat(document.getElementById('uzr').value) || 0, // For fWAR
         'UBR': parseFloat(document.getElementById('ubr').value) || 0,
         'POS': document.getElementById('pos').value
      };

      const hitOrSingleValue = parseInt(document.getElementById('hits-singles-input').value) || 0;

      if (currentInputMode === 'hits') {
         const H = hitOrSingleValue;
         inputs['1B'] = H - inputs['2B'] - inputs['3B'] - inputs['HR'];
      } else {
         inputs['1B'] = hitOrSingleValue;
      }

      const H_total = inputs['1B'] + inputs['2B'] + inputs['3B'] + inputs['HR'];
      const PA = inputs.AB + inputs.BB + inputs.HBP + inputs.SF;
      
      if (PA === 0) return;

      const obp = (H_total + inputs.BB + inputs.HBP) / PA;
      const totalBases = (inputs['1B'] * 1) + (inputs['2B'] * 2) + (inputs['3B'] * 3) + (inputs['HR'] * 4);
      const slg = inputs.AB > 0 ? totalBases / inputs.AB : 0;
      const ops = obp + slg;

      // Common Components for WAR
      const wOBA_SCALE = 1.242;
      const LG_WOBA = 0.310;
      const wOBA = ((0.7 * (inputs.BB + inputs.HBP)) + (0.9 * inputs['1B']) + (wOBA_SCALE * inputs['2B']) + (1.6 * inputs['3B']) + (2.0 * inputs.HR)) / PA;
      const battingRuns = ((wOBA - LG_WOBA) / wOBA_SCALE) * PA;
      const wSB = (inputs.SB * 0.2) - (inputs.CS * 0.4);
      const baserunningRuns = wSB + inputs.UBR;
      const posAdjustments = { 'C': 12.5, 'SS': 7.5, '2B': 2.5, '3B': 2.5, 'CF': 2.5, 'RF': -7.5, 'LF': -7.5, '1B': -12.5, 'DH': -17.5 };
      const posAdjustment = (posAdjustments[inputs.POS] / 162) * 162;
      const replacementRuns = (PA / 600) * 20;
      const RUNS_PER_WIN = 10;

      // Calculate RAR and WAR for both systems
      const RAR_bWAR = battingRuns + baserunningRuns + inputs.DRS + posAdjustment + replacementRuns;
      const RAR_fWAR = battingRuns + baserunningRuns + inputs.UZR + posAdjustment + replacementRuns;

      const bWAR = RAR_bWAR / RUNS_PER_WIN;
      const fWAR = RAR_fWAR / RUNS_PER_WIN;

      // Display All Results
      document.getElementById('obp-result').textContent = obp.toFixed(3);
      document.getElementById('slg-result').textContent = slg.toFixed(3);
      document.getElementById('ops-result').textContent = ops.toFixed(3);
      document.getElementById('bwar-result').textContent = bWAR.toFixed(1);
      document.getElementById('fwar-result').textContent = fWAR.toFixed(1);
   }
});