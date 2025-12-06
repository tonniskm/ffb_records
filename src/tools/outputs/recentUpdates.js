import { useLayoutEffect, useRef, useState } from "react";
import { NamePicker } from "./misc/misc";
import { CompareRecords } from "../calculations/compareRecords";

export const RecentUpdates = ({ records, oldRecords, weekOldRecords, pickMacro, vars }) => {
  const [weekYear, setWeekYear] = useState('Week');
  const stickyRef = useRef(null)
  const [stickyHeight,setStickyHeight] = useState(0)
  useLayoutEffect(() => {
      if (stickyRef.current) {
          setStickyHeight(stickyRef.current.offsetHeight)
      }
  }, []) // empty dependency ensures this runs once after first layout
  const lists = weekYear === 'Week'
    ? CompareRecords(records, weekOldRecords)
    : CompareRecords(records, oldRecords);

  const pickWY = (
    <NamePicker
      title={'Past week or year: '}
      showAll={false}
      selecting={setWeekYear}
      curval={weekYear}
      options={vars.currentYear===vars.yearMin?['Week']:['Week', 'Year']}
      key="wy"
    />
  );
  const relevantChoices = [pickMacro, pickWY];

  let out = [];
  const head1 = (
    <div className="tableRow headerRow" style={{top:stickyHeight,zIndex:4}} key="hr0">
      <div className="headerCell headerRow" style={{top:stickyRef,zIndex:4,left:0}}><p className="txt">Record Title</p></div>
      <div className="headerCell description"><p className="txt">Description</p></div>
      <div className="headerCell"><p className="txt">New Record</p></div>
      <div className="headerCell"><p className="txt">Previous Holder</p></div>
    </div>
  );

  const count = lists.records.length + lists.overall.length + lists.fantasy.length;
  if (count === 0) return <p>no recent updates</p>;

  if (lists.records.length !== 0) {
    out.push(head1);
    for (const [i, item] of lists.records.entries()) {
      let newWin = item.now.winnerValue[0];
      let newLose = item.now.loserValue;
      let newLoseLine = [];
      let prevVal;

      for (let j = 0; j < item.now.loser.length; j++) {
        const name = item.now.loser[j];
        let val = newLose[j];
        if (newLose === 'NA') val = 'NA';
        if (!item.now.winner.includes(name)) {
          if (!isNaN(val)) val = Math.round(100 * val) / 100;
          let valOut = val === prevVal ? '' : val.toString() + '\n';
          newLoseLine.push(valOut + name);
          prevVal = val;
        }
      }

      if (newLoseLine.length === 0) {
        newLoseLine = ['Record Holders Except:'].concat(item.now.winner.filter(x => !item.now.loser.includes(x)));
      }

      if (!isNaN(newWin)) newWin = Math.round(100 * newWin) / 100;
      else newWin = 'N/A';

      const row = (
        <div className="tableRow" key={`record-${i}-${item.title}`}>
          <div className="headerCell headerRow" style={{left:0,zIndex:3}} ><p className="txt">{item.title}</p></div>
          <div className="tableCell description"><p className="txt">{item.desc}</p></div>
          <div className="tableCell"><p className="txt">{newWin + '\n' + item.now.winner.join('\n')}</p></div>
          <div className="tableCell"><p className="txt">{newLoseLine.join('\n')}</p></div>
        </div>
      );

      out.push(row);
    }
  }

  // overall updates
  let overall = [];
  if (lists.overall.length + lists.fantasy.length !== 0) {
    overall.push(
      <div className="tableRow" key="overall-header">
        <div className="headerCell"><p className="txt">Name</p></div>
        <div className="headerCell description"><p className="txt">Record ID</p></div>
        <div className="headerCell"><p className="txt">New PB</p></div>
        <div className="headerCell"><p className="txt">Old PB</p></div>
      </div>
    );

    for (const [i, item] of lists.overall.concat(lists.fantasy).entries()) {
      let newVal, oldVal;
      if (isNaN(item.new) || isNaN(item.old)) {
        newVal = item.new;
        oldVal = item.old;
      } else {
        newVal = Math.round(100 * item.new) / 100;
        oldVal = Math.round(100 * item.old) / 100;
      }

      overall.push(
        <div className="tableRow" key={`overall-${i}-${item.key}`}>
          <div className="headerCell"><p className="txt">{item.name}</p></div>
          <div className="tableCell"><p className="txt">{item.key}</p></div>
          <div className="tableCell"><p className="txt">{newVal}</p></div>
          <div className="tableCell"><p className="txt">{oldVal}</p></div>
        </div>
      );
    }
  }

  const realOut = [
    <div className="topContainer" key="topcontrecent" ref={stickyRef}>
      <div className="buttonsContainer" key="butcont">
        {relevantChoices}
      </div>
    </div>,
    <div className="tableContainer" key="recent-table">
      {out}
      {overall}
    </div>
  ];

  return realOut;
};
