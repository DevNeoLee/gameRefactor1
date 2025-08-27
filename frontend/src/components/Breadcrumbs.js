import Breadcrumb from 'react-bootstrap/Breadcrumb';

function BreadcrumbExample() {
  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/welcome">Welcome</Breadcrumb.Item>
      <Breadcrumb.Item href="/instruction" active={true} > Instruction1</Breadcrumb.Item>
      <Breadcrumb.Item href="/waitingroom" active={true} >Waiting Room 1</Breadcrumb.Item>
      <Breadcrumb.Item href="/questionnaire" active={true} >Questionnaire</Breadcrumb.Item>
      <Breadcrumb.Item href="/end" active={true} >End</Breadcrumb.Item>
    </Breadcrumb>
  );
}

export default BreadcrumbExample;