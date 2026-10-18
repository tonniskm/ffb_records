import { fireEvent, render, screen } from "@testing-library/react"
import { SummaryTable } from "./summaryTable"

test('shows Spread Covered W-L-T records in overall and yearly summaries',()=>{
    const overall = {W:{Alice:2},'games played':{Alice:4},'Good Gambler':{Alice:[2,1,1]}}
    const year = {W:{Alice:1},'games played':{Alice:2},'Good Gambler':{Alice:[1,0,1]}}
    render(<SummaryTable records={{overall,year:{2026:year}}}
        vars={{activeNames:['Alice'],activeYears:[2026]}} />)
    expect(screen.getByText('Spread Covered')).toBeTruthy()
    expect(screen.queryByText('Good Gambler')).toBeNull()
    expect(screen.getByText('2-1-1')).toBeTruthy()
    fireEvent.change(screen.getAllByRole('combobox')[0],{target:{value:'2026'}})
    expect(screen.getByText('1-0-1')).toBeTruthy()
    expect(screen.getByText('Spread Covered')).toBeTruthy()
})
