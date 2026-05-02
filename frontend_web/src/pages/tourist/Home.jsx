import React from 'react';
import HeroBanner from '../../components/tourist/home_page/HeroBanner';
import WhyChooseUs from '../../components/tourist/home_page/WhyChooseUs';
import TrendingDestinations from '../../components/tourist/home_page/TrendingDestinations';
import CommunityFeed from '../../components/tourist/home_page/CommunityFeed';
import Accommodations from '../../components/tourist/home_page/Accommodations';
import SpecialOffers from '../../components/tourist/home_page/SpecialOffers';
import PopularActivities from '../../components/tourist/home_page/PopularActivities';

import RecommendedServices from '../../components/tourist/RecommendedServices';

const HomePage = () => {
    return (
        <React.Fragment>
            <HeroBanner />
            <RecommendedServices />
            <TrendingDestinations />
            <Accommodations />
            <PopularActivities />
            <SpecialOffers />
            <CommunityFeed />
            <WhyChooseUs />
        </React.Fragment>
    );
};

export default HomePage;