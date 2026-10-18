import { fireEvent, render, screen } from "@testing-library/react"
import { WeeklyReview } from "./weeklyReview"

jest.mock("../calculations/getNames",()=>({
    getNames:()=>['t0','Alice','Bob']
}))

test.each([
    [1,120,100],
    [2,90,110],
    ['TIE',100,100]
])('shows projections beside the correct scores for winner %s',(winner,score1,score2)=>{
    const game = {Week:1,Team1:1,Team2:2,Score1:score1,Score2:score2,winner,type:'REG'}
    const awards = ['ga6','ga3','ga3.1','ga4','ga4.1','ga5','ga5.1','ga1','wa1']
        .map(id=>({id,values:[]}))
    const records = {
        yearProj:{2026:{projections:{Alice:{1:105.34,2:0},Bob:{1:115.67}}}},
        allProj:[
            {year:2026,week:1,NFLName:'Quarterback',actual:20,projected:18.25,pos:'QB',slot:'QB',team:'Alice',oppo:'Bob',didStart:true},
            {year:2026,week:1,NFLName:'Flex Player',actual:10,projected:0,pos:'RB',slot:'FLEX',team:'Bob',oppo:'Alice',didStart:true},
            {year:2026,week:1,NFLName:'Missing Projection',actual:5,projected:NaN,pos:'WR',slot:'WR',team:'Alice',oppo:'Bob',didStart:true}
        ],matchupTable:{Alice:{Bob:[1,0,0]},Bob:{Alice:[0,1,0]}}
    }
    render(<WeeklyReview raw={{2026:[game,{...game,Week:2}]}} records={records} awards={awards}
        vars={{activeYears:[2026],activeWeeks:[1,2],activeNames:['Alice','Bob'],leagueID:'test'}} />)
    expect(screen.getByText('(0)').tagName).toBe('EM')
    expect(document.querySelectorAll('em')).toHaveLength(1)
    expect(screen.queryByText(/N\/A/)).toBeNull()
    fireEvent.change(screen.getAllByRole('combobox')[1],{target:{value:'1'}})
    for(const [name,score,projection] of [['Alice',score1,105.34],['Bob',score2,115.67]]){
        const projected = screen.getByText('('+projection+')')
        expect(projected.tagName).toBe('EM')
        expect(projected.parentElement.className).toBe('smallText')
        const card = projected.closest('.player')
        expect(card.querySelector('.bigText').textContent).toBe(name)
        expect(card.querySelectorAll('.bigText')[1].textContent).toBe(String(score))
        expect(projected.parentElement.previousElementSibling.textContent).toBe(String(score))
    }
    for(const [player,actual,projection] of [['Quarterback',20,18.25],['Flex Player',10,0]]){
        const projected = screen.getByText('('+projection+')')
        expect(projected.tagName).toBe('EM')
        expect(projected.parentElement.className).toBe('smallText')
        expect(projected.parentElement.previousElementSibling.textContent).toBe(player+', '+actual)
    }
    expect(screen.getByText('Missing Projection, 5').nextElementSibling.querySelector('em')).toBeNull()
    expect(document.querySelectorAll('em')).toHaveLength(4)
})
