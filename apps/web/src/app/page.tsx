import Wrapper from '../components/layout/Wrapper'
import HomeMain from './(homes)/home-1/page'

export const metadata = {
  title: 'RentUp - All In One Renting App',
  description:
    'Your number one property renting App',
}

export default function home() {
  return (
    <Wrapper>
      <HomeMain/>
    </Wrapper>
  )
}