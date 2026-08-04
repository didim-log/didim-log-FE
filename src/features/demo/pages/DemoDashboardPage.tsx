import { Layout } from '../../../components/layout/Layout';
import { DashboardContent } from '../../dashboard/components/DashboardContent';
import { DemoHeader } from '../components/DemoHeader';
import { DemoModeBar } from '../components/DemoModeBar';
import {
    DEMO_CATEGORY_META,
    DEMO_DASHBOARD,
    DEMO_NOTICES,
    DEMO_PROBLEMS,
    DEMO_STATISTICS,
} from '../data/demo.fixture';

export const DemoDashboardPage = () => {
    return (
        <div data-testid="demo-dashboard-page">
            <Layout
                header={(
                    <>
                        <DemoHeader showRecommendationLink />
                        <DemoModeBar step={3} />
                    </>
                )}
                footer={null}
                enableTour={false}
            >
                <DashboardContent
                    dashboard={DEMO_DASHBOARD}
                    demoMode
                    demoProblems={DEMO_PROBLEMS}
                    demoCategoryMeta={DEMO_CATEGORY_META}
                    demoStatistics={DEMO_STATISTICS}
                    demoNotices={DEMO_NOTICES}
                    problemPath={(problemId) => `/demo/problems/${problemId}`}
                />
            </Layout>
        </div>
    );
};
