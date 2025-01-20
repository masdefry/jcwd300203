import React from 'react';
import { Panel } from 'rsuite';

type PageContentProps = React.PropsWithChildren<Record<string, unknown>>;

const PageContent: React.FC<PageContentProps> = props => {
  return (
    <>
      <Panel style={{ background: '#fff' }} {...props} />
    </>
  );
};

export default PageContent;