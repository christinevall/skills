/**
 * The public entry: import { Button, Section } from '<package>'.
 * Plus the stylesheet once per app: import '<package>/styles.css'.
 *
 * layout (the grid) → components → patterns → templates.
 * Add every new component here, or agents and the site cannot import it.
 */

// ---- Layout
export { Container, type ContainerProps } from './layout/Container/Container';
export { Section, type SectionProps } from './layout/Section/Section';
export { Grid, type GridProps } from './layout/Grid/Grid';
export { Col, type ColProps } from './layout/Grid/Col';
export { Stack, type StackProps } from './layout/Stack/Stack';
export { Cluster, type ClusterProps } from './layout/Cluster/Cluster';

// ---- Components
export { Heading, type HeadingProps } from './components/Heading/Heading';
export { Text, type TextProps } from './components/Text/Text';
export { Link, type LinkProps } from './components/Link/Link';
export { Button, type ButtonProps } from './components/Button/Button';
export { Icon, type IconProps, type IconName } from './components/Icon/Icon';
export { iconNames } from './components/Icon/icons';
export { Image, type ImageProps } from './components/Image/Image';
export { SkipLink, type SkipLinkProps } from './components/SkipLink/SkipLink';
export { Spinner, type SpinnerProps } from './components/Spinner/Spinner';

// ---- Patterns

// ---- Templates
