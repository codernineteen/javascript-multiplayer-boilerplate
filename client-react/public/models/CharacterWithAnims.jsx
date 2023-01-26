/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.3 characterWithAnims.glb
*/

import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/characterWithAnims.glb')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh name="Alpha_Joints" geometry={nodes.Alpha_Joints.geometry} material={materials['Alpha_Joints_MAT.001']} skeleton={nodes.Alpha_Joints.skeleton} />
          <skinnedMesh name="Alpha_Surface" geometry={nodes.Alpha_Surface.geometry} material={materials['Alpha_Body_MAT.001']} skeleton={nodes.Alpha_Surface.skeleton} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/characterWithAnims.glb')