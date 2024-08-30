namespace Kaioken {
  export type FC<T = {}> = ((props: FCProps<T>) => JSX.Element) & {
    displayName?: string

    // inertia kaioken adapter adds this property to align with inertia docs when users want to layout
    layout?: Kaioken.FC<any>
  }
}
